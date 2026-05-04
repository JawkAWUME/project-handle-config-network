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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const firewall_entity_1 = require("../firewalls/firewall.entity");
const router_entity_1 = require("../routers/router.entity");
const switch_entity_1 = require("../switchs/switch.entity");
const site_entity_1 = require("../sites/site.entity");
const user_entity_1 = require("../users/user.entity");
let DashboardController = class DashboardController {
    firewallsRepo;
    routersRepo;
    switchesRepo;
    sitesRepo;
    usersRepo;
    constructor(firewallsRepo, routersRepo, switchesRepo, sitesRepo, usersRepo) {
        this.firewallsRepo = firewallsRepo;
        this.routersRepo = routersRepo;
        this.switchesRepo = switchesRepo;
        this.sitesRepo = sitesRepo;
        this.usersRepo = usersRepo;
    }
    async index(req) {
        const [totalFirewalls, activeFirewalls, totalRouters, activeRouters, totalSwitches, activeSwitches, totalSites, totalUsers,] = await Promise.all([
            this.firewallsRepo.count(),
            this.firewallsRepo.count({ where: { status: firewall_entity_1.EquipmentStatus.ACTIVE } }),
            this.routersRepo.count(),
            this.routersRepo.count({ where: { status: firewall_entity_1.EquipmentStatus.ACTIVE } }),
            this.switchesRepo.count(),
            this.switchesRepo.count({ where: { status: firewall_entity_1.EquipmentStatus.ACTIVE } }),
            this.sitesRepo.count(),
            this.usersRepo.count({ where: { is_active: true } }),
        ]);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const [fwNeedBackup, rtNeedBackup, swNeedBackup] = await Promise.all([
            this.firewallsRepo.createQueryBuilder('fw')
                .where('fw.last_backup IS NULL OR fw.last_backup < :d', { d: sevenDaysAgo })
                .getCount(),
            this.routersRepo.createQueryBuilder('r')
                .where('r.last_backup IS NULL OR r.last_backup < :d', { d: sevenDaysAgo })
                .getCount(),
            this.switchesRepo.createQueryBuilder('sw')
                .where('sw.last_backup IS NULL OR sw.last_backup < :d', { d: sevenDaysAgo })
                .getCount(),
        ]);
        const firewallsByBrand = await this.firewallsRepo
            .createQueryBuilder('fw')
            .select('fw.brand', 'brand')
            .addSelect('COUNT(*)', 'count')
            .groupBy('fw.brand')
            .getRawMany();
        const routersByBrand = await this.routersRepo
            .createQueryBuilder('r')
            .select('r.brand', 'brand')
            .addSelect('COUNT(*)', 'count')
            .groupBy('r.brand')
            .getRawMany();
        return {
            success: true,
            data: {
                kpis: {
                    firewalls: { total: totalFirewalls, active: activeFirewalls, inactive: totalFirewalls - activeFirewalls },
                    routers: { total: totalRouters, active: activeRouters, inactive: totalRouters - activeRouters },
                    switches: { total: totalSwitches, active: activeSwitches, inactive: totalSwitches - activeSwitches },
                    sites: { total: totalSites },
                    users: { total: totalUsers },
                },
                backup_alerts: {
                    firewalls: fwNeedBackup,
                    routers: rtNeedBackup,
                    switches: swNeedBackup,
                    total: fwNeedBackup + rtNeedBackup + swNeedBackup,
                },
                charts: {
                    firewalls_by_brand: firewallsByBrand,
                    routers_by_brand: routersByBrand,
                },
                user: req.user,
            },
            timestamp: new Date().toISOString(),
        };
    }
    async sites() {
        const sites = await this.sitesRepo.find({ order: { name: 'ASC' } });
        const siteSummaries = await Promise.all(sites.map(async (site) => {
            const [firewalls, routers, switches] = await Promise.all([
                this.firewallsRepo.count({ where: { site_id: site.id } }),
                this.routersRepo.count({ where: { site_id: site.id } }),
                this.switchesRepo.count({ where: { site_id: site.id } }),
            ]);
            return {
                id: site.id,
                name: site.name,
                code: site.code,
                city: site.city,
                country: site.country,
                status: site.status,
                equipment: { firewalls, routers, switches, total: firewalls + routers + switches },
            };
        }));
        return {
            success: true,
            data: siteSummaries,
            timestamp: new Date().toISOString(),
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "index", null);
__decorate([
    (0, common_1.Get)('sites'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "sites", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    __param(0, (0, typeorm_1.InjectRepository)(firewall_entity_1.Firewall)),
    __param(1, (0, typeorm_1.InjectRepository)(router_entity_1.Router)),
    __param(2, (0, typeorm_1.InjectRepository)(switch_entity_1.Switch)),
    __param(3, (0, typeorm_1.InjectRepository)(site_entity_1.Site)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map