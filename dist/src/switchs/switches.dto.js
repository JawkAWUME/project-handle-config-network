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
exports.SwitchQueryDto = exports.UpdateSwitchDto = exports.CreateSwitchDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const switch_entity_1 = require("./switch.entity");
class CreateSwitchDto {
    name;
    site_id;
    brand;
    model;
    firmware_version;
    serial_number;
    asset_tag;
    ip_nms;
    ip_service;
    vlan_nms;
    vlan_service;
    username;
    password;
    ports_total;
    ports_used;
    configuration;
    status;
    notes;
}
exports.CreateSwitchDto = CreateSwitchDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSwitchDto.prototype, "site_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "model", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "firmware_version", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "serial_number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "asset_tag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "ip_nms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "ip_service", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(4094),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSwitchDto.prototype, "vlan_nms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(4094),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSwitchDto.prototype, "vlan_service", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSwitchDto.prototype, "ports_total", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateSwitchDto.prototype, "ports_used", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: switch_entity_1.EquipmentStatus, default: switch_entity_1.EquipmentStatus.ACTIVE }),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSwitchDto.prototype, "notes", void 0);
class UpdateSwitchDto extends CreateSwitchDto {
}
exports.UpdateSwitchDto = UpdateSwitchDto;
class SwitchQueryDto {
    search;
    status;
    brand;
    site_id;
    limit;
}
exports.SwitchQueryDto = SwitchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(switch_entity_1.EquipmentStatus),
    __metadata("design:type", String)
], SwitchQueryDto.prototype, "status", void 0);
//# sourceMappingURL=switches.dto.js.map