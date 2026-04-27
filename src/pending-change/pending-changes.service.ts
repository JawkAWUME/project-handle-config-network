import { forwardRef, Inject, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { PendingChange } from "./pending-change.entity";
import { RoutersService } from "src/routers/routers.service";
import { CreateRouterDto, UpdateRouterDto } from "src/routers/routers.dto";
import { CreateSwitchDto, UpdateSwitchDto } from "src/switchs/switches.dto";
import { SwitchesService } from "src/switchs/switches.service";
import { CreateFirewallDto, UpdateFirewallDto } from "src/firewalls/firewalls.dto";
import { FirewallsService } from "src/firewalls/firewalls.service";
import { CreateSiteDto, UpdateSiteDto } from "src/sites/sites.dto";
import { SitesService } from "src/sites/sites.service";

@Injectable()
export class PendingChangeService {
  constructor(
    @InjectRepository(PendingChange)
    private pendingRepo: Repository<PendingChange>,

    @Inject(forwardRef(() => RoutersService))
    private routersService: RoutersService,

    @Inject(forwardRef(() => SwitchesService))
    private switchesService: SwitchesService,

    @Inject(forwardRef(() => FirewallsService))
    private firewallsService: FirewallsService,

    @Inject(forwardRef(() => SitesService))
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
    if (!change) throw new NotFoundException('Demande introuvable.');

    switch (change.action) {
      case 'create':
        await this.applyCreate(change, adminId);
        break;
      case 'update':
        await this.applyUpdate(change, adminId);
        break;
      default:
        throw new BadRequestException('Action non supportée.');
    }

    change.status = 'approved';
    change.reviewed_by_id = adminId;
    change.reviewed_at = new Date();
    await this.pendingRepo.save(change);
  }

  private async applyCreate(change: PendingChange, adminId: number) {
    const data = change.new_data;
    if (!data || !data.name) throw new BadRequestException('Données invalides (nom manquant).');

    switch (change.entity_type) {
      case 'router': {
        const dto = Object.assign(new CreateRouterDto(), data);
        await this.routersService.create(dto, { sub: adminId });
        break;
      }
      case 'switch': {
        const dto = Object.assign(new CreateSwitchDto(), data);
        await this.switchesService.create(dto, { sub: adminId });
        break;
      }
      case 'firewall': {
        const dto = Object.assign(new CreateFirewallDto(), data);
        await this.firewallsService.create(dto, { sub: adminId });
        break;
      }
      case 'site': {
        const dto = Object.assign(new CreateSiteDto(), data);
        await this.sitesService.create(dto, { sub: adminId });
        break;
      }
      default:
        throw new BadRequestException('Type d’entité inconnu.');
    }
  }

  private async applyUpdate(change: PendingChange, adminId: number) {
    const data = change.new_data;
    if (!data || !data.name) throw new BadRequestException('Données invalides (nom manquant).');

    switch (change.entity_type) {
      case 'router': {
        const dto = Object.assign(new UpdateRouterDto(), data);
        await this.routersService.update(change.entity_id, dto, { sub: adminId });
        break;
      }
      case 'switch': {
        const dto = Object.assign(new UpdateSwitchDto(), data);
        await this.switchesService.update(change.entity_id, dto, { sub: adminId });
        break;
      }
      case 'firewall': {
        const dto = Object.assign(new UpdateFirewallDto(), data);
        await this.firewallsService.update(change.entity_id, dto, { sub: adminId });
        break;
      }
      case 'site': {
        const dto = Object.assign(new UpdateSiteDto(), data);
        await this.sitesService.update(change.entity_id, dto, { sub: adminId });
        break;
      }
      default:
        throw new BadRequestException('Type d’entité inconnu.');
    }
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