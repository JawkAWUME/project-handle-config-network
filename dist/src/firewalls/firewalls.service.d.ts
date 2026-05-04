import { Repository } from 'typeorm';
import { Firewall } from './firewall.entity';
import { ConfigurationHistory } from '../config-history/config-history.entity';
import { CreateFirewallDto, UpdateFirewallDto, FirewallQueryDto } from './firewalls.dto';
export declare class FirewallsService {
    private firewallsRepository;
    private configHistoryRepository;
    constructor(firewallsRepository: Repository<Firewall>, configHistoryRepository: Repository<ConfigurationHistory>);
    findAll(query: FirewallQueryDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: number): Promise<any>;
    create(dto: CreateFirewallDto, user: any): Promise<any>;
    update(id: number, dto: UpdateFirewallDto, user: any): Promise<any>;
    remove(id: number, user: any): Promise<void>;
    getStatistics(): Promise<any>;
    testConnectivity(id: number): Promise<any>;
    getDashboardKpis(): Promise<any>;
    exportToExcel(): Promise<Buffer>;
    private formatFirewall;
    private getConnectionTypeLabel;
    updateSecurityPolicies(id: number, policies: string, user: any): Promise<Firewall>;
}
