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
exports.RoutersController = void 0;
const common_1 = require("@nestjs/common");
const routers_service_1 = require("./routers.service");
const routers_dto_1 = require("./routers.dto");
const index_1 = require("../index");
const user_entity_1 = require("../users/user.entity");
const pending_changes_service_1 = require("../pending-change/pending-changes.service");
let RoutersController = class RoutersController {
    routersService;
    pendingChangeService;
    constructor(routersService, pendingChangeService) {
        this.routersService = routersService;
        this.pendingChangeService = pendingChangeService;
    }
    async index(query) {
        const result = await this.routersService.findAll(query);
        return { success: true, ...result, timestamp: new Date().toISOString() };
    }
    async export(res) {
        const buffer = await this.routersService.exportToExcel();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="routeurs_${new Date().toISOString().split('T')[0]}.xlsx"`,
        });
        res.send(buffer);
    }
    async statistics() {
        const stats = await this.routersService.getStatistics();
        return { success: true, data: stats };
    }
    async store(dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const router = await this.routersService.create(dto, user);
            return { success: true, message: 'Routeur créé avec succès', data: router };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const pending = await this.pendingChangeService.create({
                entity_type: 'router',
                entity_id: undefined,
                action: 'create',
                new_data: dto,
                old_data: undefined,
                requested_by_id: user.id,
            });
            return {
                success: true,
                message: 'Votre demande de création a été soumise à l’approbation d’un administrateur.',
                pending_id: pending.id,
            };
        }
        throw new common_1.ForbiddenException('Action non autorisée');
    }
    async show(id) {
        const router = await this.routersService.findOne(id);
        return { success: true, data: router };
    }
    async update(id, dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const router = await this.routersService.update(id, dto, user);
            return { success: true, message: 'Routeur mis à jour', data: router };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.routersService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'router',
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
            await this.routersService.remove(id, user);
            return { success: true, message: 'Routeur supprimé avec succès' };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.routersService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'router',
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
    async backup(id, req) {
        const backup = await this.routersService.createBackup(id, req.user.sub);
        return { success: true, message: 'Backup créé', data: backup };
    }
    async restore(id, backupId, req) {
        const restore = await this.routersService.restoreFromBackup(id, backupId, req.user.sub);
        return { success: true, message: 'Configuration restaurée', data: restore };
    }
    async updateInterfaces(id, interfacesConfig, req) {
        const result = await this.routersService.updateInterfaces(id, interfacesConfig, req.user);
        return { success: true, message: 'Interfaces mises à jour', data: result };
    }
};
exports.RoutersController = RoutersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [routers_dto_1.RouterQueryDto]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "index", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "statistics", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [routers_dto_1.CreateRouterDto, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "store", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "show", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, routers_dto_1.UpdateRouterDto, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "destroy", null);
__decorate([
    (0, common_1.Post)(':id/backup'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "backup", null);
__decorate([
    (0, common_1.Post)(':id/restore/:backupId'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('backupId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "restore", null);
__decorate([
    (0, common_1.Post)(':id/update-interfaces'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('interfacesConfig')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], RoutersController.prototype, "updateInterfaces", null);
exports.RoutersController = RoutersController = __decorate([
    (0, common_1.Controller)('routers'),
    (0, index_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AGENT),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => pending_changes_service_1.PendingChangeService))),
    __metadata("design:paramtypes", [routers_service_1.RoutersService,
        pending_changes_service_1.PendingChangeService])
], RoutersController);
//# sourceMappingURL=routers.controller.js.map