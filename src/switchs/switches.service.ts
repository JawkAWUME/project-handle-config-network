import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Switch } from './switch.entity';
import { CreateSwitchDto, UpdateSwitchDto, SwitchQueryDto } from './switches.dto';
import { ConfigurationHistory, ChangeType } from '../config-history/config-history.entity';
import { UserRole } from '../users/user.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class SwitchesService {
  constructor(
    @InjectRepository(Switch)
    private switchesRepository: Repository<Switch>,
    @InjectRepository(ConfigurationHistory)
    private configHistoryRepository: Repository<ConfigurationHistory>,
  ) {}

  async findAll(query: SwitchQueryDto): Promise<{ data: any[]; total: number }> {
    const qb = this.switchesRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.site', 'site');

    if (query.search) {
      qb.where(
        's.name ILIKE :s OR s.model ILIKE :s OR s.ip_nms ILIKE :s OR s.ip_service ILIKE :s OR site.name ILIKE :s',
        { s: `%${query.search}%` },
      );
    }
    if (query.status && query.status !== 'all') {
      qb.andWhere('s.status = :status', { status: query.status === 'active' });
    }
    if (query.brand && query.brand !== 'all') {
      qb.andWhere('s.brand = :brand', { brand: query.brand });
    }
    if (query.site_id && query.site_id !== 0) {
      qb.andWhere('s.site_id = :site_id', { site_id: query.site_id });
    }

    qb.orderBy('s.name', 'ASC');
    if (query.limit) qb.limit(query.limit);

    const [switches, total] = await qb.getManyAndCount();
    return { data: switches.map(s => this.formatSwitch(s)), total };
  }

  async findOne(id: number): Promise<any> {
    const sw = await this.switchesRepository.findOne({
      where: { id },
      relations: ['site', 'user'],
    });
    if (!sw) throw new NotFoundException('Switch introuvable.');

    const history = await this.configHistoryRepository.find({
      where: { device_type: 'SwitchModel', device_id: id },
      order: { created_at: 'DESC' },
      take: 5,
    });

    return { ...this.formatSwitch(sw), configuration_histories: history };
  }

  async create(dto: CreateSwitchDto, user: any): Promise<any> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas créer des switches.');
    }

    const data: any = { ...dto, user_id: user.sub };
    if (dto.status !== undefined) data.status = dto.status;

    const sw = this.switchesRepository.create(data);
    const saved = await this.switchesRepository.save(sw);
    const savedId = Array.isArray(saved) ? (saved[0] as Switch).id : (saved as Switch).id;
    const loaded = await this.switchesRepository.findOne({ where: { id: savedId }, relations: ['site'] });
    return this.formatSwitch(loaded!);
  }

  async update(id: number, dto: UpdateSwitchDto, user: any): Promise<any> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas modifier des switches.');
    }
    const sw = await this.switchesRepository.findOne({ where: { id } });
    if (!sw) throw new NotFoundException('Switch introuvable.');

    Object.assign(sw, dto);
    await this.switchesRepository.save(sw);
    const loaded = await this.switchesRepository.findOne({ where: { id }, relations: ['site'] });
    if (!loaded) throw new NotFoundException('Switch introuvable.');
    return this.formatSwitch(loaded!);
  }

  async remove(id: number, user: any): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut supprimer des switches.');
    }
    const sw = await this.switchesRepository.findOne({ where: { id } });
    if (!sw) throw new NotFoundException('Switch introuvable.');
    await this.switchesRepository.remove(sw);
  }

  async createBackup(id: number, userId: number, notes?: string): Promise<ConfigurationHistory> {
    const sw = await this.findOne(id);
    const backup = await this.configHistoryRepository.save({
      device_type: 'SwitchModel',
      device_id: id,
      configuration: sw.configuration,
      user_id: userId,
      change_type: ChangeType.BACKUP,
      notes: notes || 'Backup automatique',
    });
    await this.switchesRepository.update(id, { last_backup: new Date() });
    return backup;
  }

  async getStatistics(): Promise<any> {
    const total = await this.switchesRepository.count();
    const active = await this.switchesRepository.count({ where: { status: 'active' } });
    const inactive = total - active;

    const byBrand = await this.switchesRepository
      .createQueryBuilder('s')
      .select('s.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.brand')
      .getRawMany();

    const totalPorts = await this.switchesRepository
      .createQueryBuilder('s')
      .select('SUM(s.ports_total)', 'total')
      .getRawOne();
    const usedPorts = await this.switchesRepository
      .createQueryBuilder('s')
      .select('SUM(s.ports_used)', 'used')
      .getRawOne();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const needingBackup = await this.switchesRepository
      .createQueryBuilder('s')
      .where('s.last_backup IS NULL OR s.last_backup < :date', { date: sevenDaysAgo })
      .getCount();

    return {
      total,
      by_status: { active, inactive },
      total_ports: totalPorts.total || 0,
      used_ports: usedPorts.used || 0,
      needing_backup: needingBackup,
      by_brand: byBrand,
    };
  }

 async exportToExcel(): Promise<Buffer> {
  const switches = await this.switchesRepository.find({
    relations: ['site'],
    order: { name: 'ASC' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Switches');

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
    { header: 'Version firmware', key: 'firmware_version', width: 20 },
    { header: 'Ports (total/used)', key: 'ports', width: 18 },
    { header: 'N° Série', key: 'serial_number', width: 20 },
    { header: 'Statut', key: 'status', width: 12 },
    { header: 'Dernier backup', key: 'last_backup', width: 20 },
    { header: 'Configuration ports', key: 'port_config', width: 60 }, // ← nouvelle colonne
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2196F3' } };

  switches.forEach(s => {
    let configText = s.port_config || '';
    if (configText.length > 30000) configText = configText.substring(0, 30000) + '… (tronqué)';
    
    sheet.addRow({
      id: s.id,
      name: s.name,
      site: s.site?.name ?? 'N/A',
      brand: s.brand,
      model: s.model,
      ip_nms: s.ip_nms,
      ip_service: s.ip_service,
      vlan_nms: s.vlan_nms,
      vlan_service: s.vlan_service,
      firmware_version: s.firmware_version,
      ports: `${s.ports_used}/${s.ports_total}`,
      serial_number: s.serial_number,
      status: s.status ? 'Actif' : 'Inactif',
      last_backup: s.last_backup ? new Date(s.last_backup).toLocaleDateString('fr-FR') : 'Jamais',
      port_config: configText,
    });
  });

  sheet.getColumn('port_config').alignment = { wrapText: true, vertical: 'top' };
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

  private formatSwitch(sw: Switch): any {
    return {
      id: sw.id,
      name: sw.name,
      brand: sw.brand,
      model: sw.model,
      status: sw.status ? 'active' : 'inactive',
      username: sw.username,
      ip_nms: sw.ip_nms,
      ip_service: sw.ip_service,
      vlan_nms: sw.vlan_nms,
      vlan_service: sw.vlan_service,
      firmware_version: sw.firmware_version,
      ports_total: sw.ports_total,
      ports_used: sw.ports_used,
      serial_number: sw.serial_number,
      asset_tag: sw.asset_tag,
      notes: sw.notes,
      updated_at: sw.updated_at?.toISOString(),
      site: sw.site?.name ?? 'N/A',
      site_id: sw.site_id,
      port_config: sw.port_config,   // ← AJOUTÉ
    };
  }

  async updatePorts(id: number, configuration: string, user: any): Promise<Switch> {
    const sw = await this.switchesRepository.findOne({ where: { id } });
    if (!sw) throw new NotFoundException('Switch introuvable.');
    sw.port_config = configuration;
    await this.switchesRepository.save(sw);
    return sw;
  }
}