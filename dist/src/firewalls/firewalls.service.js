"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirewallsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const firewall_entity_1 = require("./firewall.entity");
const config_history_entity_1 = require("../config-history/config-history.entity");
const user_entity_1 = require("../users/user.entity");
const ExcelJS = __importStar(require("exceljs"));
let FirewallsService = class FirewallsService {
    firewallsRepository;
    configHistoryRepository;
    constructor(firewallsRepository, configHistoryRepository) {
        this.firewallsRepository = firewallsRepository;
        this.configHistoryRepository = configHistoryRepository;
    }
    async findAll(query) {
        const qb = this.firewallsRepository
            .createQueryBuilder('fw')
            .leftJoinAndSelect('fw.site', 'site');
        if (query.search) {
            qb.where('fw.name ILIKE :s OR fw.model ILIKE :s OR fw.ip_nms ILIKE :s OR fw.ip_service ILIKE :s OR site.name ILIKE :s', { s: `%${query.search}%` });
        }
        if (query.status && query.status !== 'all') {
            let statusEnum = null;
            switch (query.status) {
                case 'active':
                    statusEnum = firewall_entity_1.EquipmentStatus.ACTIVE;
                    break;
                case 'inactive':
                    statusEnum = firewall_entity_1.EquipmentStatus.INACTIVE;
                    break;
                case 'warning':
                    statusEnum = firewall_entity_1.EquipmentStatus.WARNING;
                    break;
                case 'danger':
                    statusEnum = firewall_entity_1.EquipmentStatus.DANGER;
                    break;
            }
            if (statusEnum)
                qb.andWhere('fw.status = :status', { status: statusEnum });
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
        if (query.limit)
            qb.limit(Number(query.limit));
        const [firewalls, total] = await qb.getManyAndCount();
        return { data: firewalls.map(fw => this.formatFirewall(fw)), total };
    }
    async findOne(id) {
        const fw = await this.firewallsRepository.findOne({
            where: { id },
            relations: ['site', 'user'],
        });
        if (!fw)
            throw new common_1.NotFoundException('Firewall introuvable.');
        const history = await this.configHistoryRepository.find({
            where: { device_type: config_history_entity_1.DeviceType.FIREWALL, device_id: id },
            order: { created_at: 'DESC' },
            take: 5,
        });
        return { ...this.formatFirewall(fw), configuration_histories: history };
    }
    async create(dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas créer des firewalls.');
        }
        const data = { ...dto, user_id: user.sub };
        if (dto.status) {
            switch (dto.status) {
                case 'active':
                    data.status = firewall_entity_1.EquipmentStatus.ACTIVE;
                    break;
                case 'inactive':
                    data.status = firewall_entity_1.EquipmentStatus.INACTIVE;
                    break;
                case 'warning':
                    data.status = firewall_entity_1.EquipmentStatus.WARNING;
                    break;
                case 'danger':
                    data.status = firewall_entity_1.EquipmentStatus.DANGER;
                    break;
            }
        }
        const fw = this.firewallsRepository.create(data);
        const saved = await this.firewallsRepository.save(fw);
        const savedId = Array.isArray(saved) ? saved[0].id : saved.id;
        const loaded = await this.firewallsRepository.findOne({ where: { id: savedId }, relations: ['site'], cache: false });
        if (!loaded)
            throw new common_1.NotFoundException('Firewall introuvable.');
        return this.formatFirewall(loaded);
    }
    async update(id, dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas modifier des firewalls.');
        }
        const fw = await this.firewallsRepository.findOne({ where: { id } });
        if (!fw)
            throw new common_1.NotFoundException('Firewall introuvable.');
        const data = { ...dto };
        if (dto.status !== undefined) {
            switch (dto.status) {
                case 'active':
                    data.status = firewall_entity_1.EquipmentStatus.ACTIVE;
                    break;
                case 'inactive':
                    data.status = firewall_entity_1.EquipmentStatus.INACTIVE;
                    break;
                case 'warning':
                    data.status = firewall_entity_1.EquipmentStatus.WARNING;
                    break;
                case 'danger':
                    data.status = firewall_entity_1.EquipmentStatus.DANGER;
                    break;
            }
        }
        Object.assign(fw, data);
        await this.firewallsRepository.save(fw);
        const loaded = await this.firewallsRepository
            .createQueryBuilder('fw')
            .leftJoinAndSelect('fw.site', 'site')
            .where('fw.id = :id', { id })
            .getOne();
        if (!loaded)
            throw new common_1.NotFoundException('Firewall introuvable.');
        return this.formatFirewall(loaded);
    }
    async remove(id, user) {
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Seul un admin peut supprimer des firewalls.');
        }
        const fw = await this.firewallsRepository.findOne({ where: { id } });
        if (!fw)
            throw new common_1.NotFoundException('Firewall introuvable.');
        await this.firewallsRepository.remove(fw);
    }
    async getStatistics() {
        const total = await this.firewallsRepository.count();
        const active = await this.firewallsRepository.count({ where: { status: firewall_entity_1.EquipmentStatus.ACTIVE } });
        const inactive = await this.firewallsRepository.count({ where: { status: firewall_entity_1.EquipmentStatus.INACTIVE } });
        const warning = await this.firewallsRepository.count({ where: { status: firewall_entity_1.EquipmentStatus.WARNING } });
        const danger = await this.firewallsRepository.count({ where: { status: firewall_entity_1.EquipmentStatus.DANGER } });
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
            by_status: { active, inactive, warning, danger },
            ha_enabled: haEnabled,
            needing_backup: needingBackup,
            by_brand: byBrand,
            by_type: byType,
        };
    }
    async testConnectivity(id) {
        const fw = await this.firewallsRepository.findOne({ where: { id } });
        if (!fw)
            throw new common_1.NotFoundException('Firewall introuvable.');
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
    async getDashboardKpis() {
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
    async exportToExcel() {
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
            { header: 'Configuration (politiques)', key: 'configuration', width: 60 },
        ];
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE53935' } };
        firewalls.forEach(fw => {
            let configText = fw.configuration || '';
            if (configText.length > 30000)
                configText = configText.substring(0, 30000) + '… (tronqué)';
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
                status: fw.status === firewall_entity_1.EquipmentStatus.ACTIVE ? 'Actif'
                    : fw.status === firewall_entity_1.EquipmentStatus.INACTIVE ? 'Inactif'
                        : fw.status === firewall_entity_1.EquipmentStatus.WARNING ? 'Alerte'
                            : 'Danger',
                high_availability: fw.high_availability ? 'Oui' : 'Non',
                monitoring_enabled: fw.monitoring_enabled ? 'Oui' : 'Non',
                cpu: fw.cpu,
                memory: fw.memory,
                last_backup: fw.last_backup ? new Date(fw.last_backup).toLocaleDateString('fr-FR') : 'Jamais',
                configuration: configText,
            });
        });
        sheet.getColumn('configuration').alignment = { wrapText: true, vertical: 'top' };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    formatFirewall(fw) {
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
            security_policies_count: fw.security_policies_count ??
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
            configuration: fw.configuration,
        };
    }
    getConnectionTypeLabel(type) {
        if (!type)
            return 'Non défini';
        const labels = {
            [firewall_entity_1.ConnectionType.FH]: 'Faisceau Hertzien',
            [firewall_entity_1.ConnectionType.FO]: 'Fibre Optique',
            [firewall_entity_1.ConnectionType.BOTH]: 'FH + FO',
        };
        return labels[type];
    }
    async updateSecurityPolicies(id, policies, user) {
        const fw = await this.firewallsRepository.findOne({ where: { id } });
        if (!fw)
            throw new common_1.NotFoundException('Firewall introuvable.');
        fw.configuration = policies;
        await this.firewallsRepository.save(fw);
        return fw;
    }
};
exports.FirewallsService = FirewallsService;
exports.FirewallsService = FirewallsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(firewall_entity_1.Firewall)),
    __param(1, (0, typeorm_1.InjectRepository)(config_history_entity_1.ConfigurationHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FirewallsService);
//# sourceMappingURL=firewalls.service.js.map