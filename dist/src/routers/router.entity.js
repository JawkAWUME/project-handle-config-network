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
exports.Router = exports.EquipmentStatus = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const site_entity_1 = require("../sites/site.entity");
const user_entity_1 = require("../users/user.entity");
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["ACTIVE"] = "active";
    EquipmentStatus["INACTIVE"] = "inactive";
    EquipmentStatus["WARNING"] = "warning";
    EquipmentStatus["DANGER"] = "danger";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
let Router = class Router {
    id;
    name;
    site_id;
    site;
    user_id;
    user;
    brand;
    model;
    interfaces;
    interfaces_count;
    interfaces_up_count;
    routing_protocols;
    management_ip;
    ip_nms;
    ip_service;
    vlan_nms;
    vlan_service;
    username;
    password;
    enable_password;
    configuration;
    configuration_file;
    operating_system;
    serial_number;
    asset_tag;
    status;
    last_backup;
    notes;
    created_at;
    updated_at;
    interfaces_config;
    get fullName() {
        return `${this.name} (${this.brand} ${this.model})`;
    }
    get backupStatus() {
        if (!this.last_backup) {
            return { status: 'warning', message: 'Jamais sauvegardé' };
        }
        const days = (Date.now() - new Date(this.last_backup).getTime()) / (1000 * 60 * 60 * 24);
        if (days <= 1)
            return { status: 'success', message: 'Récent (<24h)' };
        if (days <= 7)
            return { status: 'info', message: 'Récent (<7 jours)' };
        return { status: 'danger', message: 'Ancien (>7 jours)' };
    }
};
exports.Router = Router;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Router.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Router.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Router.prototype, "site_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_entity_1.Site, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'site_id' }),
    __metadata("design:type", site_entity_1.Site)
], Router.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Router.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Router.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], Router.prototype, "interfaces", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Router.prototype, "interfaces_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Router.prototype, "interfaces_up_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], Router.prototype, "routing_protocols", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "management_ip", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "ip_nms", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "ip_service", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Router.prototype, "vlan_nms", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Router.prototype, "vlan_service", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Router.prototype, "enable_password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Router.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Router.prototype, "configuration_file", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "operating_system", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "serial_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "asset_tag", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.ACTIVE }),
    __metadata("design:type", String)
], Router.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Router.prototype, "last_backup", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Router.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Router.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Router.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Router.prototype, "interfaces_config", void 0);
exports.Router = Router = __decorate([
    (0, typeorm_1.Entity)('routers')
], Router);
//# sourceMappingURL=router.entity.js.map