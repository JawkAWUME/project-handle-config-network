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
exports.SwitchesController = void 0;
const common_1 = require("@nestjs/common");
const switches_service_1 = require("./switches.service");
const switches_dto_1 = require("./switches.dto");
const index_1 = require("../index");
const user_entity_1 = require("../users/user.entity");
const pending_changes_service_1 = require("../pending-change/pending-changes.service");
let SwitchesController = class SwitchesController {
    switchesService;
    pendingChangeService;
    constructor(switchesService, pendingChangeService) {
        this.switchesService = switchesService;
        this.pendingChangeService = pendingChangeService;
    }
    async index(query) {
        const result = await this.switchesService.findAll(query);
        return { success: true, ...result, timestamp: new Date().toISOString() };
    }
    async export(res) {
        const buffer = await this.switchesService.exportToExcel();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="switches_${new Date().toISOString().split('T')[0]}.xlsx"`,
        });
        res.send(buffer);
    }
    async statistics() {
        const stats = await this.switchesService.getStatistics();
        return { success: true, data: stats };
    }
    async store(dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const sw = await this.switchesService.create(dto, user);
            return { success: true, message: 'Switch créé avec succès', data: sw };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const pending = await this.pendingChangeService.create({
                entity_type: 'switch',
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
        const sw = await this.switchesService.findOne(id);
        return { success: true, data: sw };
    }
    async update(id, dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const sw = await this.switchesService.update(id, dto, user);
            return { success: true, message: 'Switch mis à jour', data: sw };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.switchesService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'switch',
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
            await this.switchesService.remove(id, user);
            return { success: true, message: 'Switch supprimé avec succès' };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.switchesService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'switch',
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
        const backup = await this.switchesService.createBackup(id, req.user.sub);
        return { success: true, message: 'Backup créé', data: backup };
    }
    async updatePorts(id, configuration, req) {
        const result = await this.switchesService.updatePorts(id, configuration, req.user);
        return { success: true, message: 'Configuration des ports mise à jour', data: result };
    }
};
exports.SwitchesController = SwitchesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [switches_dto_1.SwitchQueryDto]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "index", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "statistics", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [switches_dto_1.CreateSwitchDto, Object]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "store", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "show", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, switches_dto_1.UpdateSwitchDto, Object]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "destroy", null);
__decorate([
    (0, common_1.Post)(':id/backup'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "backup", null);
__decorate([
    (0, common_1.Post)(':id/port-configuration'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('configuration')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], SwitchesController.prototype, "updatePorts", null);
exports.SwitchesController = SwitchesController = __decorate([
    (0, common_1.Controller)('switches'),
    (0, index_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AGENT),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => pending_changes_service_1.PendingChangeService))),
    __metadata("design:paramtypes", [switches_service_1.SwitchesService,
        pending_changes_service_1.PendingChangeService])
], SwitchesController);
//# sourceMappingURL=switches.controller.js.map