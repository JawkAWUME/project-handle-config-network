"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwitchesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const switch_entity_1 = require("./switch.entity");
const switches_service_1 = require("./switches.service");
const switches_controller_1 = require("./switches.controller");
const config_history_entity_1 = require("../config-history/config-history.entity");
const pending_change_entity_1 = require("../pending-change/pending-change.entity");
const pending_change_module_1 = require("../pending-change/pending-change.module");
let SwitchesModule = class SwitchesModule {
};
exports.SwitchesModule = SwitchesModule;
exports.SwitchesModule = SwitchesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([switch_entity_1.Switch, config_history_entity_1.ConfigurationHistory, pending_change_entity_1.PendingChange]),
            (0, common_1.forwardRef)(() => pending_change_module_1.PendingChangeModule)],
        controllers: [switches_controller_1.SwitchesController],
        providers: [switches_service_1.SwitchesService],
        exports: [switches_service_1.SwitchesService],
    })
], SwitchesModule);
//# sourceMappingURL=switch.module.js.map