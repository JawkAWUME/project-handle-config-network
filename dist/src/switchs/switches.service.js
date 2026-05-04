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
exports.SwitchesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const switch_entity_1 = require("./switch.entity");
const config_history_entity_1 = require("../config-history/config-history.entity");
const user_entity_1 = require("../users/user.entity");
const ExcelJS = __importStar(require("exceljs"));
let SwitchesService = class SwitchesService {
    switchesRepository;
    configHistoryRepository;
    constructor(switchesRepository, configHistoryRepository) {
        this.switchesRepository = switchesRepository;
        this.configHistoryRepository = configHistoryRepository;
    }
    async findAll(query) {
        const qb = this.switchesRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.site', 'site');
        if (query.search) {
            qb.where('s.name ILIKE :s OR s.model ILIKE :s OR s.ip_nms ILIKE :s OR s.ip_service ILIKE :s OR site.name ILIKE :s', { s: `%${query.search}%` });
        }
        if (query.status) {
            qb.andWhere('s.status = :status', { status: switch_entity_1.EquipmentStatus.ACTIVE });
        }
        if (query.brand && query.brand !== 'all') {
            qb.andWhere('s.brand = :brand', { brand: query.brand });
        }
        if (query.site_id && query.site_id !== 0) {
            qb.andWhere('s.site_id = :site_id', { site_id: query.site_id });
        }
        qb.orderBy('s.name', 'ASC');
        if (query.limit)
            qb.limit(query.limit);
        const [switches, total] = await qb.getManyAndCount();
        return { data: switches.map(s => this.formatSwitch(s)), total };
    }
    async findOne(id) {
        const sw = await this.switchesRepository.findOne({
            where: { id },
            relations: ['site', 'user'],
        });
        if (!sw)
            throw new common_1.NotFoundException('Switch introuvable.');
        const history = await this.configHistoryRepository.find({
            where: { device_type: 'SwitchModel', device_id: id },
            order: { created_at: 'DESC' },
            take: 5,
        });
        return { ...this.formatSwitch(sw), configuration_histories: history };
    }
    async create(dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas créer des switches.');
        }
        const data = { ...dto, user_id: user.sub };
        if (dto.status)
            data.status = dto.status;
        const sw = this.switchesRepository.create(data);
        const saved = await this.switchesRepository.save(sw);
        const savedId = Array.isArray(saved) ? saved[0].id : saved.id;
        const loaded = await this.switchesRepository.findOne({ where: { id: savedId }, relations: ['site'] });
        return this.formatSwitch(loaded);
    }
    async update(id, dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas modifier des switches.');
        }
        const sw = await this.switchesRepository.findOne({ where: { id } });
        if (!sw)
            throw new common_1.NotFoundException('Switch introuvable.');
        const updateData = { ...dto };
        if (dto.status !== undefined) {
            updateData.status = dto.status;
        }
        Object.assign(sw, updateData);
        await this.switchesRepository.save(sw);
        const loaded = await this.switchesRepository
            .createQueryBuilder('s')
            .leftJoinAndSelect('s.site', 'site')
            .where('s.id = :id', { id })
            .getOne();
        if (!loaded)
            throw new common_1.NotFoundException('Switch introuvable.');
        return this.formatSwitch(loaded);
    }
    async remove(id, user) {
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Seul un admin peut supprimer des switches.');
        }
        const sw = await this.switchesRepository.findOne({ where: { id } });
        if (!sw)
            throw new common_1.NotFoundException('Switch introuvable.');
        await this.switchesRepository.remove(sw);
    }
    async createBackup(id, userId, notes) {
        const sw = await this.findOne(id);
        const backup = await this.configHistoryRepository.save({
            device_type: 'SwitchModel',
            device_id: id,
            configuration: sw.configuration,
            user_id: userId,
            change_type: config_history_entity_1.ChangeType.BACKUP,
            notes: notes || 'Backup automatique',
        });
        await this.switchesRepository.update(id, { last_backup: new Date() });
        return backup;
    }
    async getStatistics() {
        const total = await this.switchesRepository.count();
        const active = await this.switchesRepository.count({ where: { status: switch_entity_1.EquipmentStatus.ACTIVE } });
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
    async exportToExcel() {
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
            { header: 'Configuration ports', key: 'port_config', width: 60 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2196F3' } };
        switches.forEach(s => {
            let configText = s.port_config || '';
            if (configText.length > 30000)
                configText = configText.substring(0, 30000) + '… (tronqué)';
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
                status: s.status === switch_entity_1.EquipmentStatus.ACTIVE ? 'Actif'
                    : s.status === switch_entity_1.EquipmentStatus.INACTIVE ? 'Inactif'
                        : s.status === switch_entity_1.EquipmentStatus.WARNING ? 'Alerte'
                            : 'Danger',
                last_backup: s.last_backup ? new Date(s.last_backup).toLocaleDateString('fr-FR') : 'Jamais',
                port_config: configText,
            });
        });
        sheet.getColumn('port_config').alignment = { wrapText: true, vertical: 'top' };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
    formatSwitch(sw) {
        return {
            id: sw.id,
            name: sw.name,
            brand: sw.brand,
            model: sw.model,
            status: sw.status,
            connection_type: sw.connection_type,
            connection_type_label: this.getConnectionTypeLabel(sw.connection_type),
            username: sw.username,
            password: sw.password,
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
            port_config: sw.port_config,
        };
    }
    getConnectionTypeLabel(type) {
        if (!type)
            return 'Non défini';
        const labels = {
            [switch_entity_1.ConnectionType.FH]: 'Faisceau Hertzien',
            [switch_entity_1.ConnectionType.FO]: 'Fibre Optique',
            [switch_entity_1.ConnectionType.BOTH]: 'FH + FO',
        };
        return labels[type];
    }
    async updatePorts(id, configuration, user) {
        const sw = await this.switchesRepository.findOne({ where: { id } });
        if (!sw)
            throw new common_1.NotFoundException('Switch introuvable.');
        sw.port_config = configuration;
        await this.switchesRepository.save(sw);
        return sw;
    }
};
exports.SwitchesService = SwitchesService;
exports.SwitchesService = SwitchesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(switch_entity_1.Switch)),
    __param(1, (0, typeorm_1.InjectRepository)(config_history_entity_1.ConfigurationHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SwitchesService);
//# sourceMappingURL=switches.service.js.map