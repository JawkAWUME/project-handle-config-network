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
exports.FirewallsController = void 0;
const common_1 = require("@nestjs/common");
const firewalls_service_1 = require("./firewalls.service");
const firewalls_dto_1 = require("./firewalls.dto");
const index_1 = require("../index");
const user_entity_1 = require("../users/user.entity");
const pending_changes_service_1 = require("../pending-change/pending-changes.service");
let FirewallsController = class FirewallsController {
    firewallsService;
    pendingChangeService;
    constructor(firewallsService, pendingChangeService) {
        this.firewallsService = firewallsService;
        this.pendingChangeService = pendingChangeService;
    }
    async getStatistics() {
        const data = await this.firewallsService.getStatistics();
        return { success: true, data, timestamp: new Date().toISOString() };
    }
    async getDashboardKpis() {
        const data = await this.firewallsService.getDashboardKpis();
        return { success: true, data, timestamp: new Date().toISOString() };
    }
    async export(res) {
        const buffer = await this.firewallsService.exportToExcel();
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="firewalls_${new Date().toISOString().split('T')[0]}.xlsx"`,
        });
        res.send(buffer);
    }
    async getFirewalls(query) {
        const result = await this.firewallsService.findAll(query);
        return { success: true, ...result, timestamp: new Date().toISOString() };
    }
    async getFirewall(id) {
        const data = await this.firewallsService.findOne(id);
        return { success: true, data, timestamp: new Date().toISOString() };
    }
    async store(dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const data = await this.firewallsService.create(dto, user);
            return { success: true, message: 'Firewall créé avec succès', data };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const pending = await this.pendingChangeService.create({
                entity_type: 'firewall',
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
    async update(id, dto, req) {
        const user = req.user;
        if (user.role === user_entity_1.UserRole.ADMIN) {
            const data = await this.firewallsService.update(id, dto, user);
            return { success: true, message: 'Firewall mis à jour avec succès', data };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.firewallsService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'firewall',
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
            await this.firewallsService.remove(id, user);
            return { success: true, message: 'Firewall supprimé avec succès' };
        }
        else if (user.role === user_entity_1.UserRole.AGENT) {
            const current = await this.firewallsService.findOne(id);
            const pending = await this.pendingChangeService.create({
                entity_type: 'firewall',
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
    async testConnectivity(id) {
        const data = await this.firewallsService.testConnectivity(id);
        return { success: true, data, message: 'Test de connectivité terminé' };
    }
    async updateSecurityPolicies(id, policies, req) {
        const result = await this.firewallsService.updateSecurityPolicies(id, policies, req.user);
        return { success: true, message: 'Politiques de sécurité mises à jour', data: result };
    }
};
exports.FirewallsController = FirewallsController;
__decorate([
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('dashboard-kpis'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "getDashboardKpis", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "export", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [firewalls_dto_1.FirewallQueryDto]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "getFirewalls", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "getFirewall", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [firewalls_dto_1.CreateFirewallDto, Object]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "store", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, firewalls_dto_1.UpdateFirewallDto, Object]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "destroy", null);
__decorate([
    (0, common_1.Post)(':id/test-connectivity'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "testConnectivity", null);
__decorate([
    (0, common_1.Post)(':id/update-security-policies'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('policies')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], FirewallsController.prototype, "updateSecurityPolicies", null);
exports.FirewallsController = FirewallsController = __decorate([
    (0, common_1.Controller)('firewalls'),
    (0, index_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.AGENT),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => pending_changes_service_1.PendingChangeService))),
    __metadata("design:paramtypes", [firewalls_service_1.FirewallsService,
        pending_changes_service_1.PendingChangeService])
], FirewallsController);
//# sourceMappingURL=firewalls.controller.js.map