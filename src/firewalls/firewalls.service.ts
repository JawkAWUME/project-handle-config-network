import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Firewall } from './firewall.entity';
import { ConfigurationHistory, DeviceType } from '../config-history/config-history.entity';
import { CreateFirewallDto, UpdateFirewallDto, FirewallQueryDto } from './firewalls.dto';
import { UserRole } from '../users/user.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class FirewallsService {
  constructor(
    @InjectRepository(Firewall)
    private firewallsRepository: Repository<Firewall>,
    @InjectRepository(ConfigurationHistory)
    private configHistoryRepository: Repository<ConfigurationHistory>,
  ) {}

  async findAll(query: FirewallQueryDto): Promise<{ data: any[]; total: number }> {
    const qb = this.firewallsRepository
      .createQueryBuilder('fw')
      .leftJoinAndSelect('fw.site', 'site');

    if (query.search) {
      qb.where(
        'fw.name ILIKE :s OR fw.model ILIKE :s OR fw.ip_nms ILIKE :s OR fw.ip_service ILIKE :s OR site.name ILIKE :s',
        { s: `%${query.search}%` },
      );
    }
    if (query.status && query.status !== 'all') {
      qb.andWhere('fw.status = :status', { status: query.status === 'active' });
    }
    if (query.brand && query.brand !== 'all') {
      qb.andWhere('fw.brand = :brand', { brand: query.brand });
    }
    if (query.site_id && query.site_id !== 0) {
      qb.andWhere('fw.site_id = :site_id', { site_id: query.site_id });
    }
    if (query.firewall_type && query.firewall_type !== 'all') {
      qb.andWhere('fw.firewall_type = :ft', { ft: query.firewall_type });
    }

    qb.orderBy('fw.name', 'ASC');
    if (query.limit) qb.limit(Number(query.limit));

    const [firewalls, total] = await qb.getManyAndCount();
    return { data: firewalls.map(fw => this.formatFirewall(fw)), total };
  }

  async findOne(id: number): Promise<any> {
    const fw = await this.firewallsRepository.findOne({
      where: { id },
      relations: ['site', 'user'],
    });
    if (!fw) throw new NotFoundException('Firewall introuvable.');

    const history = await this.configHistoryRepository.find({
      where: { device_type: DeviceType.FIREWALL, device_id: id },
      order: { created_at: 'DESC' },
      take: 5,
    });

    return { ...this.formatFirewall(fw), configuration_histories: history };
  }

  async create(dto: CreateFirewallDto, user: any): Promise<any> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas créer des firewalls.');
    }

    const data: any = { ...dto, user_id: user.sub };
    if (dto.status) data.status = dto.status === 'active';

    const fw = this.firewallsRepository.create(data);
    const saved = await this.firewallsRepository.save(fw);
    const savedId = Array.isArray(saved) ? (saved[0] as Firewall).id : (saved as Firewall).id;
    const loaded = await this.firewallsRepository.findOne({ where: { id: savedId }, relations: ['site'] , cache: false });
    if (!loaded) throw new NotFoundException('Firewall introuvable.');
    return this.formatFirewall(loaded);
  }

  async update(id: number, dto: UpdateFirewallDto, user: any): Promise<any> {
    if (user.role === UserRole.VIEWER) {
      throw new ForbiddenException('Les viewers ne peuvent pas modifier des firewalls.');
    }
    const fw = await this.firewallsRepository.findOne({ where: { id } });
    if (!fw) throw new NotFoundException('Firewall introuvable.');

    const data: any = { ...dto };
    if (dto.status !== undefined) data.status = dto.status === 'active';

    Object.assign(fw, data);
    await this.firewallsRepository.save(fw);
    // const loaded = await this.firewallsRepository.findOne({ where: { id }, relations: ['site'], cache: false });
    const loaded = await this.firewallsRepository
    .createQueryBuilder('fw')
    .leftJoinAndSelect('fw.site', 'site')
    .where('fw.id = :id', { id })
    .getOne();
    if (!loaded) throw new NotFoundException('Firewall introuvable.');
    return this.formatFirewall(loaded);
  }

  async remove(id: number, user: any): Promise<void> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul un admin peut supprimer des firewalls.');
    }
    const fw = await this.firewallsRepository.findOne({ where: { id } });
    if (!fw) throw new NotFoundException('Firewall introuvable.');
    await this.firewallsRepository.remove(fw);
  }

  async getStatistics(): Promise<any> {
    const total = await this.firewallsRepository.count();
    const active = await this.firewallsRepository.count({ where: { status: true } });
    const inactive = total - active;
    const haEnabled = await this.firewallsRepository.count({ where: { high_availability: true } });

    const byBrand = await this.firewallsRepository
      .createQueryBuilder('fw')
      .select('fw.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .groupBy('fw.brand')
      .getRawMany();

    const byType = await this.firewallsRepository
      .createQueryBuilder('fw')
      .select('fw.firewall_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('fw.firewall_type')
      .getRawMany();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const needingBackup = await this.firewallsRepository
      .createQueryBuilder('fw')
      .where('fw.last_backup IS NULL OR fw.last_backup < :date', { date: sevenDaysAgo })
      .getCount();

    return {
      total,
      by_status: { active, inactive },
      ha_enabled: haEnabled,
      needing_backup: needingBackup,
      by_brand: byBrand,
      by_type: byType,
    };
  }

  async testConnectivity(id: number): Promise<any> {
    const fw = await this.firewallsRepository.findOne({ where: { id } });
    if (!fw) throw new NotFoundException('Firewall introuvable.');
    return {
      firewall_id: id,
      ip_nms: fw.ip_nms,
      ip_service: fw.ip_service,
      ping_nms: Math.random() > 0.2 ? 'success' : 'failed',
      ping_service: Math.random() > 0.2 ? 'success' : 'failed',
      latency_ms: Math.floor(Math.random() * 50) + 5,
      tested_at: new Date().toISOString(),
    };
  }

  async getDashboardKpis(): Promise<any> {
    const stats = await this.getStatistics();
    return {
      total: stats.total,
      active: stats.by_status.active,
      inactive: stats.by_status.inactive,
      needing_backup: stats.needing_backup,
      ha_enabled: stats.ha_enabled,
      by_brand: stats.by_brand,
      by_type: stats.by_type,
    };
  }

 async exportToExcel(): Promise<Buffer> {
  const firewalls = await this.firewallsRepository.find({
    relations: ['site'],
    order: { name: 'ASC' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Firewalls');

  sheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Nom', key: 'name', width: 25 },
    { header: 'Site', key: 'site', width: 20 },
    { header: 'Type', key: 'firewall_type', width: 15 },
    { header: 'Marque', key: 'brand', width: 15 },
    { header: 'Modèle', key: 'model', width: 15 },
    { header: 'IP NMS', key: 'ip_nms', width: 18 },
    { header: 'IP Service', key: 'ip_service', width: 18 },
    { header: 'VLAN NMS', key: 'vlan_nms', width: 12 },
    { header: 'VLAN Service', key: 'vlan_service', width: 14 },
    { header: 'Version firmware', key: 'firmware_version', width: 18 },
    { header: 'N° Série', key: 'serial_number', width: 20 },
    { header: 'Statut', key: 'status', width: 12 },
    { header: 'HA', key: 'high_availability', width: 10 },
    { header: 'Monitoring', key: 'monitoring_enabled', width: 12 },
    { header: 'CPU (%)', key: 'cpu', width: 10 },
    { header: 'Mémoire (%)', key: 'memory', width: 13 },
    { header: 'Dernier backup', key: 'last_backup', width: 20 },
    { header: 'Configuration (politiques)', key: 'configuration', width: 60 }, // ← nouvelle colonne
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE53935' } };

  firewalls.forEach(fw => {
    // Tronquer la configuration si trop longue (Excel limite à 32767 caractères)
    let configText = fw.configuration || '';
    if (configText.length > 30000) configText = configText.substring(0, 30000) + '… (tronqué)';
    
    sheet.addRow({
      id: fw.id,
      name: fw.name,
      site: fw.site?.name ?? 'N/A',
      firewall_type: fw.firewall_type,
      brand: fw.brand,
      model: fw.model,
      ip_nms: fw.ip_nms,
      ip_service: fw.ip_service,
      vlan_nms: fw.vlan_nms,
      vlan_service: fw.vlan_service,
      firmware_version: fw.firmware_version,
      serial_number: fw.serial_number,
      status: fw.status ? 'Actif' : 'Inactif',
      high_availability: fw.high_availability ? 'Oui' : 'Non',
      monitoring_enabled: fw.monitoring_enabled ? 'Oui' : 'Non',
      cpu: fw.cpu,
      memory: fw.memory,
      last_backup: fw.last_backup ? new Date(fw.last_backup).toLocaleDateString('fr-FR') : 'Jamais',
      configuration: configText,
    });
  });

  // Activer le retour à la ligne automatique pour la colonne de configuration
  sheet.getColumn('configuration').alignment = { wrapText: true, vertical: 'top' };
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

  private formatFirewall(fw: Firewall): any {
    const toStatus = (v: boolean) => (v ? 'active' : 'danger');
    return {
      id: fw.id,
      name: fw.name,
      brand: fw.brand,
      model: fw.model,
      firewall_type: fw.firewall_type,
      status: fw.status,
      connection_type: fw.connection_type,
      connection_type_label: this.getConnectionTypeLabel(fw.connection_type),
      username: fw.username,
      password: fw.password,
      enable_password: fw.enable_password,
      ip_nms: fw.ip_nms,
      ip_service: fw.ip_service,
      vlan_nms: fw.vlan_nms,
      vlan_service: fw.vlan_service,
      firmware_version: fw.firmware_version,
      security_policies_count:
        fw.security_policies_count ??
        (Array.isArray(fw.security_policies) ? fw.security_policies.length : 0),
      cpu: fw.cpu ?? 0,
      memory: fw.memory ?? 0,
      high_availability: Boolean(fw.high_availability),
      monitoring_enabled: Boolean(fw.monitoring_enabled),
      serial_number: fw.serial_number,
      asset_tag: fw.asset_tag,
      notes: fw.notes,
      updated_at: fw.updated_at?.toISOString(),
      site: fw.site?.name ?? 'N/A',
      site_id: fw.site_id,
      configuration: fw.configuration,   // ← AJOUTÉ pour stocker les politiques texte
    };
  }

  private getConnectionTypeLabel(type: ConnectionType | null): string {
    if (!type) return 'Non défini';
    const labels = {
      [ConnectionType.FH]: 'Faisceau Hertzien',
      [ConnectionType.FO]: 'Fibre Optique',
      [ConnectionType.BOTH]: 'FH + FO',
    };
    return labels[type];
  }

  async updateSecurityPolicies(id: number, policies: string, user: any): Promise<Firewall> {
    const fw = await this.firewallsRepository.findOne({ where: { id } });
    if (!fw) throw new NotFoundException('Firewall introuvable.');
    // On stocke le texte brut dans la colonne 'configuration' (type text)
    fw.configuration = policies;
    await this.firewallsRepository.save(fw);
    return fw;
  }
}