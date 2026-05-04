import type { Response } from 'express';
import { FirewallsService } from './firewalls.service';
import { CreateFirewallDto, UpdateFirewallDto, FirewallQueryDto } from './firewalls.dto';
import { PendingChangeService } from '../pending-change/pending-changes.service';
export declare class FirewallsController {
    private readonly firewallsService;
    private readonly pendingChangeService;
    constructor(firewallsService: FirewallsService, pendingChangeService: PendingChangeService);
    getStatistics(): Promise<{
        success: boolean;
        data: any;
        timestamp: string;
    }>;
    getDashboardKpis(): Promise<{
        success: boolean;
        data: any;
        timestamp: string;
    }>;
    export(res: Response): Promise<void>;
    getFirewalls(query: FirewallQueryDto): Promise<{
        timestamp: string;
        data: any[];
        total: number;
        success: boolean;
    }>;
    getFirewall(id: number): Promise<{
        success: boolean;
        data: any;
        timestamp: string;
    }>;
    store(dto: CreateFirewallDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        pending_id?: undefined;
    } | {
        success: boolean;
        message: string;
        pending_id: number;
        data?: undefined;
    }>;
    update(id: number, dto: UpdateFirewallDto, req: any): Promise<{
        success: boolean;
        message: string;
        data: any;
        pending_id?: undefined;
    } | {
        success: boolean;
        message: string;
        pending_id: number;
        data?: undefined;
    }>;
    destroy(id: number, req: any): Promise<{
        success: boolean;
        message: string;
        pending_id?: undefined;
    } | {
        success: boolean;
        message: string;
        pending_id: number;
    }>;
    testConnectivity(id: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    updateSecurityPolicies(id: number, policies: string, req: any): Promise<{
        success: boolean;
        message: string;
        data: import("./firewall.entity").Firewall;
    }>;
}
