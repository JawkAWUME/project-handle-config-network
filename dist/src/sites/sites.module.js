"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sites_controller_1 = require("./sites.controller");
const sites_service_1 = require("./sites.service");
const site_entity_1 = require("./site.entity");
const pending_change_entity_1 = require("../pending-change/pending-change.entity");
const switch_entity_1 = require("../switchs/switch.entity");
const router_entity_1 = require("../routers/router.entity");
const firewall_entity_1 = require("../firewalls/firewall.entity");
const config_history_entity_1 = require("../config-history/config-history.entity");
const pending_change_module_1 = require("../pending-change/pending-change.module");
let SitesModule = class SitesModule {
};
exports.SitesModule = SitesModule;
exports.SitesModule = SitesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([site_entity_1.Site, pending_change_entity_1.PendingChange, router_entity_1.Router, firewall_entity_1.Firewall, switch_entity_1.Switch, config_history_entity_1.ConfigurationHistory]),
            (0, common_1.forwardRef)(() => pending_change_module_1.PendingChangeModule)],
        controllers: [sites_controller_1.SitesController],
        providers: [sites_service_1.SitesService],
        exports: [sites_service_1.SitesService],
    })
], SitesModule);
//# sourceMappingURL=sites.module.js.map