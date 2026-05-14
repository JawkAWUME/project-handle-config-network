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
exports.RoutersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const router_entity_1 = require("./router.entity");
const config_history_entity_1 = require("../config-history/config-history.entity");
const user_entity_1 = require("../users/user.entity");
const ExcelJS = __importStar(require("exceljs"));
let RoutersService = class RoutersService {
    routersRepository;
    configHistoryRepository;
    constructor(routersRepository, configHistoryRepository) {
        this.routersRepository = routersRepository;
        this.configHistoryRepository = configHistoryRepository;
    }
    async findAll(query) {
        const qb = this.routersRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.site', 'site');
        if (query.search) {
            qb.where('r.name ILIKE :s OR r.model ILIKE :s OR r.ip_nms ILIKE :s OR r.ip_service ILIKE :s OR site.name ILIKE :s', { s: `%${query.search}%` });
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
        if (query.limit)
            qb.limit(query.limit);
        const [routers, total] = await qb.getManyAndCount();
        return { data: routers.map(r => this.formatRouter(r)), total };
    }
    async findOne(id) {
        const router = await this.routersRepository.findOne({
            where: { id },
            relations: ['site', 'user'],
        });
        if (!router)
            throw new common_1.NotFoundException('Routeur introuvable.');
        const history = await this.configHistoryRepository.find({
            where: { device_type: 'Router', device_id: id },
            order: { created_at: 'DESC' },
            take: 5,
        });
        return { ...this.formatRouter(router), configuration_histories: history };
    }
    async create(dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas créer des routeurs.');
        }
        const data = { ...dto, user_id: user.sub };
        if (dto.status !== undefined)
            data.status = dto.status === 'active';
        const router = this.routersRepository.create(data);
        const saved = await this.routersRepository.save(router);
        const savedId = Array.isArray(saved) ? saved[0].id : saved.id;
        const loaded = await this.routersRepository.findOne({ where: { id: savedId }, relations: ['site'] });
        if (!loaded)
            throw new common_1.NotFoundException('Routeur introuvable.');
        return this.formatRouter(loaded);
    }
    async update(id, dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas modifier des routeurs.');
        }
        const router = await this.routersRepository.findOne({ where: { id } });
        if (!router)
            throw new common_1.NotFoundException('Routeur introuvable.');
        const updateData = { ...dto };
        if (dto.status !== undefined) {
            updateData.status = dto.status === 'active';
        }
        Object.assign(router, updateData);
        await this.routersRepository.save(router);
        const loaded = await this.routersRepository
            .createQueryBuilder('r')
            .leftJoinAndSelect('r.site', 'site')
            .where('r.id = :id', { id })
            .getOne();
        if (!loaded)
            throw new common_1.NotFoundException('Routeur introuvable.');
        return this.formatRouter(loaded);
    }
    async remove(id, user) {
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Seul un admin peut supprimer des routeurs.');
        }
        const router = await this.routersRepository.findOne({ where: { id } });
        if (!router)
            throw new common_1.NotFoundException('Routeur introuvable.');
        await this.routersRepository.remove(router);
    }
    async createBackup(id, userId, notes) {
        const router = await this.findOne(id);
        const backup = await this.configHistoryRepository.save({
            device_type: 'Router',
            device_id: id,
            configuration: router.configuration,
            configuration_file: router.configuration_file,
            user_id: userId,
            change_type: config_history_entity_1.ChangeType.BACKUP,
            notes: notes || 'Backup automatique',
        });
        await this.routersRepository.update(id, { last_backup: new Date() });
        return backup;
    }
    async restoreFromBackup(routerId, backupId, userId) {
        const backup = await this.configHistoryRepository.findOne({ where: { id: backupId } });
        if (!backup)
            throw new common_1.NotFoundException('Backup introuvable.');
        if (backup.device_type !== 'Router' || backup.device_id !== routerId) {
            throw new common_1.ForbiddenException('Backup non valide pour cet équipement.');
        }
        await this.createBackup(routerId, userId, 'Pré-restauration');
        await this.routersRepository.update(routerId, {
            configuration: backup.configuration,
            configuration_file: backup.configuration_file,
        });
        const restoreLog = await this.configHistoryRepository.save({
            device_type: 'Router',
            device_id: routerId,
            configuration: backup.configuration,
            configuration_file: backup.configuration_file,
            user_id: userId,
            change_type: config_history_entity_1.ChangeType.RESTORE,
            notes: `Restauration depuis backup #${backupId}`,
            restored_from: backupId,
        });
        return restoreLog;
    }
    async getStatistics() {
        const total = await this.routersRepository.count();
        const active = await this.routersRepository.count({ where: { status: router_entity_1.EquipmentStatus.ACTIVE } });
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
    async exportToExcel() {
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
            { header: 'Configuration interfaces', key: 'interfaces_config', width: 60 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
        routers.forEach(r => {
            let configText = r.interfaces_config || '';
            if (configText.length > 30000)
                configText = configText.substring(0, 30000) + '… (tronqué)';
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
    formatRouter(router) {
        return {
            id: router.id,
            name: router.name,
            brand: router.brand,
            model: router.model,
            status: router.status,
            username: router.username,
            password: router.password,
            enable_password: router.enable_password,
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
            interfaces_config: router.interfaces_config,
        };
    }
    async updateInterfaces(id, config, user) {
        const router = await this.routersRepository.findOne({ where: { id } });
        if (!router)
            throw new common_1.NotFoundException('Routeur introuvable.');
        router.interfaces_config = config;
        await this.routersRepository.save(router);
        return router;
    }
};
exports.RoutersService = RoutersService;
exports.RoutersService = RoutersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(router_entity_1.Router)),
    __param(1, (0, typeorm_1.InjectRepository)(config_history_entity_1.ConfigurationHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RoutersService);
//# sourceMappingURL=routers.service.js.map