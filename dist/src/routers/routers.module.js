"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const router_entity_1 = require("./router.entity");
const routers_service_1 = require("./routers.service");
const routers_controller_1 = require("./routers.controller");
const config_history_entity_1 = require("../config-history/config-history.entity");
const pending_change_entity_1 = require("../pending-change/pending-change.entity");
const pending_change_module_1 = require("../pending-change/pending-change.module");
let RoutersModule = class RoutersModule {
};
exports.RoutersModule = RoutersModule;
exports.RoutersModule = RoutersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([router_entity_1.Router, config_history_entity_1.ConfigurationHistory, pending_change_entity_1.PendingChange]),
            (0, common_1.forwardRef)(() => pending_change_module_1.PendingChangeModule),
        ],
        controllers: [routers_controller_1.RoutersController],
        providers: [routers_service_1.RoutersService],
        exports: [routers_service_1.RoutersService],
    })
], RoutersModule);
//# sourceMappingURL=routers.module.js.map