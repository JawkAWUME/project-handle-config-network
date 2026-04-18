import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { PendingChange } from "./pending-change.entity";
import { RoutersService } from "src/routers/routers.service";
import { UpdateRouterDto } from "src/routers/routers.dto";
import { UpdateSwitchDto } from "src/switchs/switches.dto";
import { SwitchesService } from "src/switchs/switches.service";
import { UpdateFirewallDto } from "src/firewalls/firewalls.dto";
import { FirewallsService } from "src/firewalls/firewalls.service";
import { UpdateSiteDto } from "src/sites/sites.dto";
import { SitesService } from "src/sites/sites.service";

// pending-changes.service.ts
@Injectable()
export class PendingChangeService {
  constructor(
    @InjectRepository(PendingChange)
    private pendingRepo: Repository<PendingChange>,
    private routersService: RoutersService, 
    private switchesService: SwitchesService,
    // Injecter le service des firewalls
    private firewallsService: FirewallsService,
    // Injecter le service des sites
    private sitesService: SitesService,
  ) {}

  async create(data: Partial<PendingChange>): Promise<PendingChange> {
    const change = this.pendingRepo.create(data);
    return this.pendingRepo.save(change);
  }

  async findAllPending(): Promise<PendingChange[]> {
    return this.pendingRepo.find({
      where: { status: 'pending' },
      relations: ['requested_by'],
      order: { created_at: 'ASC' },
    });
  }

  async approve(id: number, adminId: number): Promise<void> {
    const change = await this.pendingRepo.findOneBy({ id });
    if (!change) throw new NotFoundException();
    // Appliquer la modification réelle (appel au service concerné)
    switch (change.entity_type) {
      case 'router':
        await this.routersService.update(change.entity_id, change.new_data as UpdateRouterDto, { id: adminId });
         break;
      case 'switch':
        await this.switchesService.update(change.entity_id, change.new_data as UpdateSwitchDto, { id: adminId });
            break;
      case 'firewall':
         // Appel au service des firewalls pour appliquer la modification
        await this.firewallsService.update(change.entity_id, change.new_data as UpdateFirewallDto, { id: adminId });
        break;
      case 'site':
         // Appel au service des sites pour appliquer la modification
         await this.sitesService.update(change.entity_id, change.new_data as UpdateSiteDto, { id: adminId });
        break;
        default:
          throw new Error(`Unsupported entity type: ${change.entity_type}`);

    }
    change.status = 'approved';
    change.reviewed_by_id = adminId;
    change.reviewed_at = new Date();
    await this.pendingRepo.save(change);
  }

  async reject(id: number, adminId: number, reason: string): Promise<void> {
    const change = await this.pendingRepo.findOneBy({ id });
    if (!change) throw new NotFoundException();
    change.status = 'rejected';
    change.rejection_reason = reason;
    change.reviewed_by_id = adminId;
    change.reviewed_at = new Date();
    await this.pendingRepo.save(change);
  }
}