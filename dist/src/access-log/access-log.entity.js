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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLog = exports.AccessAction = exports.AccessResult = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
var AccessResult;
(function (AccessResult) {
    AccessResult["SUCCESS"] = "success";
    AccessResult["FAILED"] = "failed";
    AccessResult["DENIED"] = "denied";
})(AccessResult || (exports.AccessResult = AccessResult = {}));
var AccessAction;
(function (AccessAction) {
    AccessAction["LOGIN"] = "login";
    AccessAction["LOGOUT"] = "logout";
    AccessAction["VIEW"] = "view";
    AccessAction["CREATE"] = "create";
    AccessAction["UPDATE"] = "update";
    AccessAction["DELETE"] = "delete";
    AccessAction["BACKUP"] = "backup";
    AccessAction["RESTORE"] = "restore";
    AccessAction["EXPORT"] = "export";
})(AccessAction || (exports.AccessAction = AccessAction = {}));
let AccessLog = class AccessLog {
    id;
    user_id;
    session_id;
    ip_address;
    user_agent;
    url;
    method;
    action;
    device_type;
    device_id;
    parameters;
    response_code;
    response_time;
    result;
    error_message;
    referrer;
    country;
    city;
    latitude;
    longitude;
    isp;
    browser;
    platform;
    device_family;
    created_at;
    updated_at;
    user;
};
exports.AccessLog = AccessLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AccessLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AccessLog.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AccessAction, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "device_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AccessLog.prototype, "device_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], AccessLog.prototype, "parameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AccessLog.prototype, "response_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', nullable: true }),
    __metadata("design:type", Number)
], AccessLog.prototype, "response_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AccessResult, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "result", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "referrer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], AccessLog.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 11, scale: 8, nullable: true }),
    __metadata("design:type", Number)
], AccessLog.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "isp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "browser", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AccessLog.prototype, "device_family", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], AccessLog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], AccessLog.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], AccessLog.prototype, "user", void 0);
exports.AccessLog = AccessLog = __decorate([
    (0, typeorm_1.Entity)('access_logs')
], AccessLog);
//# sourceMappingURL=access-log.entity.js.map