"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingChangeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pending_change_entity_1 = require("./pending-change.entity");
const routers_service_1 = require("../routers/routers.service");
const routers_dto_1 = require("../routers/routers.dto");
const switches_dto_1 = require("../switchs/switches.dto");
const switches_service_1 = require("../switchs/switches.service");
const firewalls_dto_1 = require("../firewalls/firewalls.dto");
const firewalls_service_1 = require("../firewalls/firewalls.service");
const sites_dto_1 = require("../sites/sites.dto");
const sites_service_1 = require("../sites/sites.service");
let PendingChangeService = class PendingChangeService {
    pendingRepo;
    routersService;
    switchesService;
    firewallsService;
    sitesService;
    constructor(pendingRepo, routersService, switchesService, firewallsService, sitesService) {
        this.pendingRepo = pendingRepo;
        this.routersService = routersService;
        this.switchesService = switchesService;
        this.firewallsService = firewallsService;
        this.sitesService = sitesService;
    }
    async create(data) {
        const change = this.pendingRepo.create(data);
        return this.pendingRepo.save(change);
    }
    async findAllPending() {
        return this.pendingRepo.find({
            where: { status: 'pending' },
            relations: ['requested_by'],
            order: { created_at: 'ASC' },
        });
    }
    async approve(id, adminId) {
        const change = await this.pendingRepo.findOneBy({ id });
        if (!change)
            throw new common_1.NotFoundException('Demande introuvable.');
        switch (change.action) {
            case 'create':
                await this.applyCreate(change, adminId);
                break;
            case 'update':
                await this.applyUpdate(change, adminId);
                break;
            default:
                throw new common_1.BadRequestException('Action non supportée.');
        }
        change.status = 'approved';
        change.reviewed_by_id = adminId;
        change.reviewed_at = new Date();
        await this.pendingRepo.save(change);
    }
    async applyCreate(change, adminId) {
        const data = change.new_data;
        if (!data || !data.name)
            throw new common_1.BadRequestException('Données invalides (nom manquant).');
        switch (change.entity_type) {
            case 'router': {
                const dto = Object.assign(new routers_dto_1.CreateRouterDto(), data);
                await this.routersService.create(dto, { sub: adminId });
                break;
            }
            case 'switch': {
                const dto = Object.assign(new switches_dto_1.CreateSwitchDto(), data);
                await this.switchesService.create(dto, { sub: adminId });
                break;
            }
            case 'firewall': {
                const dto = Object.assign(new firewalls_dto_1.CreateFirewallDto(), data);
                await this.firewallsService.create(dto, { sub: adminId });
                break;
            }
            case 'site': {
                const dto = Object.assign(new sites_dto_1.CreateSiteDto(), data);
                await this.sitesService.create(dto, { sub: adminId });
                break;
            }
            default:
                throw new common_1.BadRequestException('Type d’entité inconnu.');
        }
    }
    async applyUpdate(change, adminId) {
        const data = change.new_data;
        if (!data || !data.name)
            throw new common_1.BadRequestException('Données invalides (nom manquant).');
        switch (change.entity_type) {
            case 'router': {
                const dto = Object.assign(new routers_dto_1.UpdateRouterDto(), data);
                await this.routersService.update(change.entity_id, dto, { sub: adminId });
                break;
            }
            case 'switch': {
                const dto = Object.assign(new switches_dto_1.UpdateSwitchDto(), data);
                await this.switchesService.update(change.entity_id, dto, { sub: adminId });
                break;
            }
            case 'firewall': {
                const dto = Object.assign(new firewalls_dto_1.UpdateFirewallDto(), data);
                await this.firewallsService.update(change.entity_id, dto, { sub: adminId });
                break;
            }
            case 'site': {
                const dto = Object.assign(new sites_dto_1.UpdateSiteDto(), data);
                await this.sitesService.update(change.entity_id, dto, { sub: adminId });
                break;
            }
            default:
                throw new common_1.BadRequestException('Type d’entité inconnu.');
        }
    }
    async reject(id, adminId, reason) {
        const change = await this.pendingRepo.findOneBy({ id });
        if (!change)
            throw new common_1.NotFoundException();
        change.status = 'rejected';
        change.rejection_reason = reason;
        change.reviewed_by_id = adminId;
        change.reviewed_at = new Date();
        await this.pendingRepo.save(change);
    }
};
exports.PendingChangeService = PendingChangeService;
exports.PendingChangeService = PendingChangeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pending_change_entity_1.PendingChange)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => routers_service_1.RoutersService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => switches_service_1.SwitchesService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => firewalls_service_1.FirewallsService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => sites_service_1.SitesService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        routers_service_1.RoutersService,
        switches_service_1.SwitchesService,
        firewalls_service_1.FirewallsService,
        sites_service_1.SitesService])
], PendingChangeService);
//# sourceMappingURL=pending-changes.service.js.map