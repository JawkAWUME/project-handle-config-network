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
exports.ConfigurationHistory = exports.ChangeType = exports.DeviceType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
var DeviceType;
(function (DeviceType) {
    DeviceType["FIREWALL"] = "firewall";
    DeviceType["ROUTER"] = "router";
    DeviceType["SWITCH"] = "switch";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
var ChangeType;
(function (ChangeType) {
    ChangeType["CREATE"] = "create";
    ChangeType["UPDATE"] = "update";
    ChangeType["BACKUP"] = "backup";
    ChangeType["RESTORE"] = "restore";
    ChangeType["AUTO_BACKUP"] = "auto_backup";
    ChangeType["MANUAL_BACKUP"] = "manual_backup";
})(ChangeType || (exports.ChangeType = ChangeType = {}));
let ConfigurationHistory = class ConfigurationHistory {
    id;
    device_type;
    device_id;
    configuration;
    configuration_file;
    config_size;
    config_checksum;
    user_id;
    change_type;
    notes;
    restored_from;
    ip_address;
    change_summary;
    pre_change_config;
    post_change_config;
    created_at;
    updated_at;
    user;
    restoredFrom;
};
exports.ConfigurationHistory = ConfigurationHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ConfigurationHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "device_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ConfigurationHistory.prototype, "device_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "configuration_file", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ConfigurationHistory.prototype, "config_size", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "config_checksum", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ConfigurationHistory.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ChangeType, nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "change_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ConfigurationHistory.prototype, "restored_from", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "change_summary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "pre_change_config", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ConfigurationHistory.prototype, "post_change_config", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ConfigurationHistory.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], ConfigurationHistory.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ConfigurationHistory.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ConfigurationHistory, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'restored_from' }),
    __metadata("design:type", ConfigurationHistory)
], ConfigurationHistory.prototype, "restoredFrom", void 0);
exports.ConfigurationHistory = ConfigurationHistory = __decorate([
    (0, typeorm_1.Entity)('configuration_histories')
], ConfigurationHistory);
//# sourceMappingURL=config-history.entity.js.map