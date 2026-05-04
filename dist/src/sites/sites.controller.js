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
exports.SitesController = void 0;
const common_1 = require("@nestjs/common");
const sites_service_1 = require("./sites.service");
const sites_dto_1 = require("./sites.dto");
const index_1 = require("../index");
const user_entity_1 = require("../users/user.entity");
const pending_changes_service_1 = require("../pending-change/pending-changes.service");
let SitesController = class SitesController {
    sitesService;
    pendingChangeService;
    constructor(sitesService, pendingChangeService) {
        this.sitesService = sitesService;
        this.pendingChangeService = pendingChangeService;
    }
    async getSites(query) {
        const result = await this.sitesService.findAll(query);
        return { success: true, ...result, timestamp: new Date().toISOString() };
    }
    async export(res) {
        const buffer = await this.sitesService.exportToExcel();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="sites_${new Date().toISOString().split('T')[0]}.xlsx"`,
        });
        res.send(buffer);
    }
    async getSite(id) {
        const site = await this.sitesService.findOne(id);
        return { success: true, data: site, timestamp: new Date().toISOString() };
    }
    async store(dto, req) {
        const site = await this.sitesService.create(dto, req.user);
        return { success: true, message: 'Site créé avec succès', data: site };
    }
    async update(id, dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const site = await this.sitesService.update(id, dto, user);
            return { success: true, message: 'Site mis à jour', data: site };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.sitesService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'site',
                entity_id: id,
                action: 'update',
                new_data: dto,
                old_data: current,
                requested_by_id: user.id,
            });
            return {
                success: true,
                message: 'Votre modification a été soumise à l’approbation d’un administrateur.',
                pending_id: pending.id,
            };
        }
        throw new common_1.ForbiddenException('Action non autorisée');
    }
    async destroy(id, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            await this.sitesService.remove(id, user);
            return { success: true, message: 'Site supprimé avec succès' };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.sitesService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'site',
                entity_id: id,
                action: 'delete',
                new_data: undefined,
                old_data: current,
                requested_by_id: user.id,
            });
            return {
                success: true,
                message: 'Votre demande de suppression a été soumise à l’approbation.',
                pending_id: pending.id,
            };
        }
        throw new common_1.ForbiddenException('Action non autorisée');
    }
};
exports.SitesController = SitesController;
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sites_dto_1.SearchSiteDto]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "getSites", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "export", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "getSite", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sites_dto_1.CreateSiteDto, Object]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "store", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, sites_dto_1.UpdateSiteDto, Object]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SitesController.prototype, "destroy", null);
exports.SitesController = SitesController = __decorate([
    (0, common_1.Controller)('sites'),
    (0, index_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AGENT),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => pending_changes_service_1.PendingChangeService))),
    __metadata("design:paramtypes", [sites_service_1.SitesService,
        pending_changes_service_1.PendingChangeService])
], SitesController);
//# sourceMappingURL=sites.controller.js.map