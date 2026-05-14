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
exports.SitesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_entity_1 = require("./site.entity");
const user_entity_1 = require("../users/user.entity");
const ExcelJS = __importStar(require("exceljs"));
let SitesService = class SitesService {
    sitesRepository;
    constructor(sitesRepository) {
        this.sitesRepository = sitesRepository;
    }
    async findAll(query) {
        const qb = this.sitesRepository.createQueryBuilder('site');
        if (query.search) {
            qb.where('site.name ILIKE :s OR site.city ILIKE :s OR site.country ILIKE :s OR site.code ILIKE :s', { s: `%${query.search}%` });
        }
        if (query.status && query.status !== 'all') {
            qb.andWhere('site.status = :status', { status: query.status });
        }
        if (query.city) {
            qb.andWhere('site.city ILIKE :city', { city: `%${query.city}%` });
        }
        if (query.country) {
            qb.andWhere('site.country ILIKE :country', { country: `%${query.country}%` });
        }
        qb.orderBy('site.name', 'ASC');
        if (query.limit)
            qb.limit(query.limit);
        const [data, total] = await qb.getManyAndCount();
        return { data, total };
    }
    async findOne(id) {
        const site = await this.sitesRepository.findOne({ where: { id } });
        if (!site)
            throw new common_1.NotFoundException('Site introuvable.');
        return site;
    }
    async create(dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas créer des sites.');
        }
        const site = this.sitesRepository.create(dto);
        return this.sitesRepository.save(site);
    }
    async update(id, dto, user) {
        if (user.role === user_entity_1.UserRole.VIEWER) {
            throw new common_1.ForbiddenException('Les viewers ne peuvent pas modifier des sites.');
        }
        const site = await this.findOne(id);
        Object.assign(site, dto);
        return this.sitesRepository.save(site);
    }
    async remove(id, user) {
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Seul un admin peut supprimer des sites.');
        }
        const site = await this.findOne(id);
        await this.sitesRepository.remove(site);
    }
    async exportToExcel() {
        const sites = await this.sitesRepository.find({ order: { name: 'ASC' } });
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Sites');
        sheet.columns = [
            { header: 'ID', key: 'id', width: 8 },
            { header: 'Nom', key: 'name', width: 25 },
            { header: 'Code', key: 'code', width: 12 },
            { header: 'Ville', key: 'city', width: 18 },
            { header: 'Pays', key: 'country', width: 18 },
            { header: 'Adresse', key: 'address', width: 30 },
            { header: 'Contact technique', key: 'technical_contact', width: 25 },
            { header: 'Email technique', key: 'technical_email', width: 28 },
            { header: 'Téléphone', key: 'phone', width: 18 },
            { header: 'Statut', key: 'status', width: 12 },
            { header: 'Capacité', key: 'capacity', width: 12 },
            { header: 'Type de connexion', key: 'connection_type', width: 20 },
            { header: 'Créé le', key: 'created_at', width: 20 },
        ];
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern', pattern: 'solid',
            fgColor: { argb: 'FF2196F3' },
        };
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sites.forEach(s => {
            sheet.addRow({
                id: s.id,
                name: s.name,
                code: s.code,
                city: s.city,
                country: s.country,
                address: s.address,
                technical_contact: s.technical_contact,
                technical_email: s.technical_email,
                phone: s.phone,
                status: s.status,
                capacity: s.capacity,
                connection_type: s.connection_type ?? '',
                created_at: s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : '',
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return new Uint8Array(buffer);
    }
};
exports.SitesService = SitesService;
exports.SitesService = SitesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_entity_1.Site)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SitesService);
//# sourceMappingURL=sites.service.js.map