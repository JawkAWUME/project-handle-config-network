import { Repository } from 'typeorm';
import { PendingChange } from "./pending-change.entity";
import { RoutersService } from "src/routers/routers.service";
import { SwitchesService } from "src/switchs/switches.service";
import { FirewallsService } from "src/firewalls/firewalls.service";
import { SitesService } from "src/sites/sites.service";
export declare class PendingChangeService {
    private pendingRepo;
    private routersService;
    private switchesService;
    private firewallsService;
    private sitesService;
    constructor(pendingRepo: Repository<PendingChange>, routersService: RoutersService, switchesService: SwitchesService, firewallsService: FirewallsService, sitesService: SitesService);
    create(data: Partial<PendingChange>): Promise<PendingChange>;
    findAllPending(): Promise<PendingChange[]>;
    approve(id: number, adminId: number): Promise<void>;
    private applyCreate;
    private applyUpdate;
    reject(id: number, adminId: number, reason: string): Promise<void>;
}
