import { Repository } from 'typeorm';
import { Firewall } from '../firewalls/firewall.entity';
import { Router } from '../routers/router.entity';
import { Switch } from '../switchs/switch.entity';
import { Site } from '../sites/site.entity';
import { User } from '../users/user.entity';
export declare class DashboardController {
    private firewallsRepo;
    private routersRepo;
    private switchesRepo;
    private sitesRepo;
    private usersRepo;
    constructor(firewallsRepo: Repository<Firewall>, routersRepo: Repository<Router>, switchesRepo: Repository<Switch>, sitesRepo: Repository<Site>, usersRepo: Repository<User>);
    index(req: any): Promise<{
        success: boolean;
        data: {
            kpis: {
                firewalls: {
                    total: number;
                    active: number;
                    inactive: number;
                };
                routers: {
                    total: number;
                    active: number;
                    inactive: number;
                };
                switches: {
                    total: number;
                    active: number;
                    inactive: number;
                };
                sites: {
                    total: number;
                };
                users: {
                    total: number;
                };
            };
            backup_alerts: {
                firewalls: number;
                routers: number;
                switches: number;
                total: number;
            };
            charts: {
                firewalls_by_brand: any[];
                routers_by_brand: any[];
            };
            user: any;
        };
        timestamp: string;
    }>;
    sites(): Promise<{
        success: boolean;
        data: {
            id: number;
            name: string;
            code: string;
            city: string;
            country: string;
            status: string;
            equipment: {
                firewalls: number;
                routers: number;
                switches: number;
                total: number;
            };
        }[];
        timestamp: string;
    }>;
}
