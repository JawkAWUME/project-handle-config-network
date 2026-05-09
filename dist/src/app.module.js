"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const sites_module_1 = require("./sites/sites.module");
const firewalls_module_1 = require("./firewalls/firewalls.module");
const routers_module_1 = require("./routers/routers.module");
const switch_module_1 = require("./switchs/switch.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const user_entity_1 = require("./users/user.entity");
const site_entity_1 = require("./sites/site.entity");
const firewall_entity_1 = require("./firewalls/firewall.entity");
const router_entity_1 = require("./routers/router.entity");
const switch_entity_1 = require("./switchs/switch.entity");
const config_history_entity_1 = require("./config-history/config-history.entity");
const access_log_entity_1 = require("./access-log/access-log.entity");
const pending_change_module_1 = require("./pending-change/pending-change.module");
const ssh_module_1 = require("./ssh/ssh.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${process.env.APP_ENV || 'development'}`,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (config) => {
                    const isProd = config.get('APP_ENV') === 'production';
                    const databaseUrl = config.get('DATABASE_URL');
                    if (databaseUrl) {
                        return {
                            type: isProd ? 'postgres' : 'mysql',
                            url: databaseUrl,
                            entities: [user_entity_1.User, site_entity_1.Site, firewall_entity_1.Firewall, router_entity_1.Router, switch_entity_1.Switch, config_history_entity_1.ConfigurationHistory, access_log_entity_1.AccessLog],
                            synchronize: false,
                            logging: config.get('APP_ENV') === 'development',
                            ssl: isProd ? { rejectUnauthorized: false } : false,
                            connectTimeout: 30000,
                            extra: {
                                max: 20,
                                idleTimeoutMillis: 30000,
                                connectionTimeoutMillis: 30000,
                            },
                            connectTimeoutMS: 15000
                        };
                    }
                    const dbType = config.get('DB_TYPE') || 'mysql';
                    return {
                        type: dbType,
                        host: config.get('DB_HOST'),
                        port: config.get('DB_PORT'),
                        username: config.get('DB_USERNAME'),
                        password: config.get('DB_PASSWORD'),
                        database: config.get('DB_DATABASE'),
                        entities: [user_entity_1.User, site_entity_1.Site, firewall_entity_1.Firewall, router_entity_1.Router, switch_entity_1.Switch, config_history_entity_1.ConfigurationHistory, access_log_entity_1.AccessLog],
                        synchronize: !isProd,
                        logging: config.get('APP_ENV') === 'development',
                        ...(dbType === 'postgres' && isProd ? { ssl: { rejectUnauthorized: false } } : {}),
                    };
                },
            }),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'secret',
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRES_IN
                        ? parseInt(process.env.JWT_EXPIRES_IN)
                        : '24h',
                },
            }),
            passport_1.PassportModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            pending_change_module_1.PendingChangeModule,
            sites_module_1.SitesModule,
            firewalls_module_1.FirewallsModule,
            routers_module_1.RoutersModule,
            switch_module_1.SwitchesModule,
            ssh_module_1.SshModule,
            dashboard_module_1.DashboardModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map