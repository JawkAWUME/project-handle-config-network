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
exports.PendingChangesController = void 0;
const common_1 = require("@nestjs/common");
const src_1 = require("..");
const user_entity_1 = require("../users/user.entity");
const pending_changes_service_1 = require("./pending-changes.service");
let PendingChangesController = class PendingChangesController {
    pendingService;
    constructor(pendingService) {
        this.pendingService = pendingService;
    }
    async list() {
        const changes = await this.pendingService.findAllPending();
        return { success: true, data: changes };
    }
    async approve(id, req) {
        await this.pendingService.approve(id, req.user.id);
        return { success: true, message: 'Modification approuvée et appliquée.' };
    }
    async reject(id, reason, req) {
        await this.pendingService.reject(id, req.user.id, reason);
        return { success: true, message: 'Modification rejetée.' };
    }
};
exports.PendingChangesController = PendingChangesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PendingChangesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PendingChangesController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Object]),
    __metadata("design:returntype", Promise)
], PendingChangesController.prototype, "reject", null);
exports.PendingChangesController = PendingChangesController = __decorate([
    (0, common_1.Controller)('admin/pending-changes'),
    (0, src_1.Roles)(user_entity_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [pending_changes_service_1.PendingChangeService])
], PendingChangesController);
//# sourceMappingURL=pending-changes.controller.js.map