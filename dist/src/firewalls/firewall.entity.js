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
exports.Firewall = exports.EquipmentStatus = exports.FirewallType = void 0;
const typeorm_1 = require("typeorm");
const class_transformer_1 = require("class-transformer");
const site_entity_1 = require("../sites/site.entity");
const user_entity_1 = require("../users/user.entity");
var FirewallType;
(function (FirewallType) {
    FirewallType["PALO_ALTO"] = "palo_alto";
    FirewallType["FORTINET"] = "fortinet";
    FirewallType["CHECKPOINT"] = "checkpoint";
    FirewallType["CISCO_ASA"] = "cisco_asa";
    FirewallType["OTHER"] = "other";
})(FirewallType || (exports.FirewallType = FirewallType = {}));
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["ACTIVE"] = "active";
    EquipmentStatus["INACTIVE"] = "inactive";
    EquipmentStatus["WARNING"] = "warning";
    EquipmentStatus["DANGER"] = "danger";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
let Firewall = class Firewall {
    id;
    name;
    site_id;
    site;
    user_id;
    user;
    firewall_type;
    brand;
    model;
    ip_nms;
    ip_service;
    vlan_nms;
    vlan_service;
    username;
    password;
    enable_password;
    configuration;
    configuration_file;
    security_policies;
    nat_rules;
    vpn_configuration;
    licenses;
    firmware_version;
    serial_number;
    asset_tag;
    status;
    high_availability;
    ha_peer_id;
    monitoring_enabled;
    last_backup;
    security_policies_count;
    cpu;
    memory;
    notes;
    created_at;
    updated_at;
    get fullName() {
        return `${this.name} (${this.brand} ${this.model})`;
    }
    get haStatus() {
        if (!this.high_availability) {
            return { status: 'secondary', message: 'Non configuré' };
        }
        return { status: 'success', message: 'Actif' };
    }
    checkLicenses() {
        if (!this.licenses?.length) {
            return { status: 'warning', message: 'Aucune licence configurée' };
        }
        const now = new Date();
        let expired = 0, expiring = 0, valid = 0;
        for (const lic of this.licenses) {
            if (lic.expiration_date) {
                const exp = new Date(lic.expiration_date);
                const days = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                if (days < 0)
                    expired++;
                else if (days <= 30)
                    expiring++;
                else
                    valid++;
            }
        }
        if (expired > 0)
            return { status: 'danger', message: `${expired} licence(s) expirée(s)` };
        if (expiring > 0)
            return { status: 'warning', message: `${expiring} licence(s) expirent bientôt` };
        return { status: 'success', message: 'Toutes les licences sont valides' };
    }
};
exports.Firewall = Firewall;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Firewall.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Firewall.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "site_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_entity_1.Site, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'site_id' }),
    __metadata("design:type", site_entity_1.Site)
], Firewall.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, eager: false }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Firewall.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: FirewallType, nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "firewall_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "ip_nms", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "ip_service", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "vlan_nms", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "vlan_service", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], Firewall.prototype, "enable_password", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Firewall.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Firewall.prototype, "configuration_file", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], Firewall.prototype, "security_policies", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], Firewall.prototype, "nat_rules", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", Object)
], Firewall.prototype, "vpn_configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'json' }),
    __metadata("design:type", Array)
], Firewall.prototype, "licenses", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "firmware_version", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "serial_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Firewall.prototype, "asset_tag", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.ACTIVE }),
    __metadata("design:type", String)
], Firewall.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Firewall.prototype, "high_availability", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "ha_peer_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Firewall.prototype, "monitoring_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'timestamp' }),
    __metadata("design:type", Date)
], Firewall.prototype, "last_backup", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "security_policies_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "cpu", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Firewall.prototype, "memory", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], Firewall.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Firewall.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Firewall.prototype, "updated_at", void 0);
exports.Firewall = Firewall = __decorate([
    (0, typeorm_1.Entity)('firewalls')
], Firewall);
//# sourceMappingURL=firewall.entity.js.map