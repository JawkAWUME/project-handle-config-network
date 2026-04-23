import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Router } from './router.entity';
import { CreateRouterDto, UpdateRouterDto, RouterQueryDto } from './routers.dto';
import { ConfigurationHistory, ChangeType } from '../config-history/config-history.entity';
import { UserRole } from '../users/user.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class RoutersService {
  constructor(
    @InjectRepository(Router)
    private routersRepository: Repository<Router>,
    @InjectRepository(ConfigurationHistory)
    private configHistoryRepository: Repository<ConfigurationHistory>,
  ) {}

  async findAll(query: RouterQueryDto): Promise<{ data: any[]; total: number }> {
    const qb = this.routersRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.site', 'site');

    if (query.search) {
      qb.where(
        'r.name ILIKE :s OR r.model ILIKE :s OR r.ip_nms ILIKE :s OR r.ip_service ILIKE :s OR site.name ILIKE :s',
        { s: `%${query.search}%` },
      );
    }
    if (query.status && query.status !== 'all') {
      qb.andWhere('r.status = :status', { status: query.status === 'active' });
    }
    if (query.brand && query.brand !== 'all') {
      qb.andWhere('r.brand = :brand', { brand: query.brand });
    }
    if (query.site_id && query.site_id !== 0) {
      qb.andWhere('r.site_id = :site_id', { site_id: query.site_id });
    }

    qb.orderBy('r.name', 'ASC');
    if (query.limit) qb.limit(query.limit);

    const [routers, total] = await qb.getManyAndCount();
    return { data: routers.map(r => this.formatRouter(r)), total };
  }

  async findOne(id: number): Promise<any> {
    const router = await this.routersRepository.findOne({
      where: { id },
      relations: ['site', 'user'],
    });
    if (!router) throw new NotFoundException('Routeur introuvable.');

    const history = await this.configHistoryRepository.find({
      where: { device_type: 'Router', device_id: id },
      order: { created_at: 'DESC' },
      take: 5,
    });

    return { ...this.formatRouter(router), configuration_histories: history };
  }

  async create(dto: CreateRouterDto, user: any): Promise<any> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas créer des routeurs.');
    }

    const data: any = { ...dto, user_id: user.sub };
    if (dto.status !== undefined) data.status = dto.status === 'active';

    const router = this.routersRepository.create(data);
    const saved = await this.routersRepository.save(router);
    const savedId = Array.isArray(saved) ? (saved[0] as Router).id : (saved as Router).id;
    const loaded = await this.routersRepository.findOne({ where: { id: savedId }, relations: ['site'] });
    if (!loaded) throw new NotFoundException('Routeur introuvable.');
    return this.formatRouter(loaded);
  }

  async update(id: number, dto: UpdateRouterDto, user: any): Promise<any> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas modifier des routeurs.');
    }
    const router = await this.routersRepository.findOne({ where: { id } });
    if (!router) throw new NotFoundException('Routeur introuvable.');

    const updateData: any = { ...dto };
  if (dto.status !== undefined) {
    updateData.status = dto.status === 'active';
  }
    Object.assign(router, updateData);
    await this.routersRepository.save(router);
    // const loaded = await this.routersRepository.findOne({ where: { id }, relations: ['site'], cache: false });
  const loaded = await this.routersRepository
  .createQueryBuilder('r')
  .leftJoinAndSelect('r.site', 'site')
  .where('r.id = :id', { id })
  .getOne();

    if (!loaded) throw new NotFoundException('Routeur introuvable.');
    return this.formatRouter(loaded);
  }

  async remove(id: number, user: any): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut supprimer des routeurs.');
    }
    const router = await this.routersRepository.findOne({ where: { id } });
    if (!router) throw new NotFoundException('Routeur introuvable.');
    await this.routersRepository.remove(router);
  }

  async createBackup(id: number, userId: number, notes?: string): Promise<ConfigurationHistory> {
    const router = await this.findOne(id);
    const backup = await this.configHistoryRepository.save({
      device_type: 'Router',
      device_id: id,
      configuration: router.configuration,
      configuration_file: router.configuration_file,
      user_id: userId,
      change_type: ChangeType.BACKUP,
      notes: notes || 'Backup automatique',
    });
    await this.routersRepository.update(id, { last_backup: new Date() });
    return backup;
  }

  async restoreFromBackup(routerId: number, backupId: number, userId: number): Promise<ConfigurationHistory> {
    const backup = await this.configHistoryRepository.findOne({ where: { id: backupId } });
    if (!backup) throw new NotFoundException('Backup introuvable.');
    if (backup.device_type !== 'Router' || backup.device_id !== routerId) {
      throw new ForbiddenException('Backup non valide pour cet équipement.');
    }

    // Create pre-restore backup
    await this.createBackup(routerId, userId, 'Pré-restauration');

    // Restore
    await this.routersRepository.update(routerId, {
      configuration: backup.configuration,
      configuration_file: backup.configuration_file,
    });

    // Log restore
    const restoreLog = await this.configHistoryRepository.save({
      device_type: 'Router',
      device_id: routerId,
      configuration: backup.configuration,
      configuration_file: backup.configuration_file,
      user_id: userId,
      change_type: ChangeType.RESTORE,
      notes: `Restauration depuis backup #${backupId}`,
      restored_from: backupId,
    });

    return restoreLog;
  }

  async getStatistics(): Promise<any> {
    const total = await this.routersRepository.count();
    const active = await this.routersRepository.count({ where: { status: true } });
    const inactive = total - active;

    const byBrand = await this.routersRepository
      .createQueryBuilder('r')
      .select('r.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.brand')
      .getRawMany();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const needingBackup = await this.routersRepository
      .createQueryBuilder('r')
      .where('r.last_backup IS NULL OR r.last_backup < :date', { date: sevenDaysAgo })
      .getCount();

    return {
      total,
      by_status: { active, inactive },
      needing_backup: needingBackup,
      by_brand: byBrand,
    };
  }

 async exportToExcel(): Promise<Buffer> {
  const routers = await this.routersRepository.find({
    relations: ['site'],
    order: { name: 'ASC' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Routeurs');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Nom', key: 'name', width: 25 },
    { header: 'Site', key: 'site', width: 20 },
    { header: 'Marque', key: 'brand', width: 15 },
    { header: 'Modèle', key: 'model', width: 15 },
    { header: 'IP NMS', key: 'ip_nms', width: 18 },
    { header: 'IP Service', key: 'ip_service', width: 18 },
    { header: 'VLAN NMS', key: 'vlan_nms', width: 12 },
    { header: 'VLAN Service', key: 'vlan_service', width: 14 },
    { header: 'OS', key: 'operating_system', width: 15 },
    { header: 'N° Série', key: 'serial_number', width: 20 },
    { header: 'Statut', key: 'status', width: 12 },
    { header: 'Dernier backup', key: 'last_backup', width: 20 },
    { header: 'Configuration interfaces', key: 'interfaces_config', width: 60 }, // ← nouvelle colonne
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };

  routers.forEach(r => {
    let configText = r.interfaces_config || '';
    if (configText.length > 30000) configText = configText.substring(0, 30000) + '… (tronqué)';
    
    sheet.addRow({
      id: r.id,
      name: r.name,
      site: r.site?.name ?? 'N/A',
      brand: r.brand,
      model: r.model,
      ip_nms: r.ip_nms,
      ip_service: r.ip_service,
      vlan_nms: r.vlan_nms,
      vlan_service: r.vlan_service,
      operating_system: r.operating_system,
      serial_number: r.serial_number,
      status: r.status ? 'Actif' : 'Inactif',
      last_backup: r.last_backup ? new Date(r.last_backup).toLocaleDateString('fr-FR') : 'Jamais',
      interfaces_config: configText,
    });
  });

  sheet.getColumn('interfaces_config').alignment = { wrapText: true, vertical: 'top' };
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
  private formatRouter(router: Router): any {
    return {
      id: router.id,
      name: router.name,
      brand: router.brand,
      model: router.model,
      status: router.status ? 'active' : 'inactive',
      username: router.username,
      ip_nms: router.ip_nms,
      ip_service: router.ip_service,
      vlan_nms: router.vlan_nms,
      vlan_service: router.vlan_service,
      operating_system: router.operating_system,
      interfaces_count: router.interfaces_count,
      interfaces_up_count: router.interfaces_up_count,
      serial_number: router.serial_number,
      asset_tag: router.asset_tag,
      notes: router.notes,
      updated_at: router.updated_at?.toISOString(),
      site: router.site?.name ?? 'N/A',
      site_id: router.site_id,
      interfaces_config: router.interfaces_config,   // ← AJOUTÉ
    };
  }

  async updateInterfaces(id: number, config: string, user: any): Promise<Router> {
    const router = await this.routersRepository.findOne({ where: { id } });
    if (!router) throw new NotFoundException('Routeur introuvable.');
    router.interfaces_config = config;
    await this.routersRepository.save(router);
    return router;
  }
}