import { Controller, Get, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentStatus, Firewall } from '../firewalls/firewall.entity';
import { Router } from '../routers/router.entity';
import { Switch } from '../switchs/switch.entity';
import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';

/**
 * Équivalent DashboardController Laravel
 * GET /api/dashboard         → KPI globaux + résumé
 * GET /api/dashboard/sites   → résumé par site
 */
@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(Firewall) private firewallsRepo: Repository<Firewall>,
    @InjectRepository(Router)   private routersRepo: Repository<Router>,
    @InjectRepository(Switch)   private switchesRepo: Repository<Switch>,
    @InjectRepository(Site)     private sitesRepo: Repository<Site>,
    @InjectRepository(User)     private usersRepo: Repository<User>,
  ) {}

  /**
   * GET /api/dashboard
   * Équivalent DashboardController::index() — KPI globaux
   */
  @Get()
  async index(@Request() req) {
    const [
      totalFirewalls, activeFirewalls,
      totalRouters, activeRouters,
      totalSwitches, activeSwitches,
      totalSites, totalUsers,
    ] = await Promise.all([
      this.firewallsRepo.count(),
      this.firewallsRepo.count({ where: {  status: EquipmentStatus.ACTIVE } }),
      this.routersRepo.count(),
      this.routersRepo.count({ where: { status:  EquipmentStatus.ACTIVE } }),
      this.switchesRepo.count(),
      this.switchesRepo.count({ where: { status:  EquipmentStatus.ACTIVE} }),
      this.sitesRepo.count(),
      this.usersRepo.count({ where: { is_active: true } }),
    ]);

    // Equipements nécessitant un backup (>7 jours)
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

    // Répartition par marque (firewalls)
    const firewallsByBrand = await this.firewallsRepo
      .createQueryBuilder('fw')
      .select('fw.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .groupBy('fw.brand')
      .getRawMany();

    // Répartition par marque (routeurs)
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
          routers:   { total: totalRouters,   active: activeRouters,   inactive: totalRouters - activeRouters },
          switches:  { total: totalSwitches,  active: activeSwitches,  inactive: totalSwitches - activeSwitches },
          sites:     { total: totalSites },
          users:     { total: totalUsers },
        },
        backup_alerts: {
          firewalls: fwNeedBackup,
          routers:   rtNeedBackup,
          switches:  swNeedBackup,
          total:     fwNeedBackup + rtNeedBackup + swNeedBackup,
        },
        charts: {
          firewalls_by_brand: firewallsByBrand,
          routers_by_brand:   routersByBrand,
        },
        user: req.user,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * GET /api/dashboard/sites
   * Résumé des équipements par site
   */
  @Get('sites')
  async sites() {
    const sites = await this.sitesRepo.find({ order: { name: 'ASC' } });

    const siteSummaries = await Promise.all(
      sites.map(async (site) => {
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
      }),
    );

    return {
      success: true,
      data: siteSummaries,
      timestamp: new Date().toISOString(),
    };
  }
}
