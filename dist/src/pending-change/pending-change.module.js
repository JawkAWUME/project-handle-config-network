"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingChangeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pending_change_entity_1 = require("./pending-change.entity");
const pending_changes_service_1 = require("./pending-changes.service");
const pending_changes_controller_1 = require("./pending-changes.controller");
const routers_module_1 = require("../routers/routers.module");
const firewalls_module_1 = require("../firewalls/firewalls.module");
const switch_module_1 = require("../switchs/switch.module");
const sites_module_1 = require("../sites/sites.module");
let PendingChangeModule = class PendingChangeModule {
};
exports.PendingChangeModule = PendingChangeModule;
exports.PendingChangeModule = PendingChangeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([pending_change_entity_1.PendingChange]),
            (0, common_1.forwardRef)(() => routers_module_1.RoutersModule),
            (0, common_1.forwardRef)(() => firewalls_module_1.FirewallsModule),
            (0, common_1.forwardRef)(() => switch_module_1.SwitchesModule),
            (0, common_1.forwardRef)(() => sites_module_1.SitesModule),
        ],
        controllers: [pending_changes_controller_1.PendingChangesController],
        providers: [pending_changes_service_1.PendingChangeService],
        exports: [pending_changes_service_1.PendingChangeService],
    })
], PendingChangeModule);
//# sourceMappingURL=pending-change.module.js.map