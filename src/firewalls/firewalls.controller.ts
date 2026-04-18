import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, Request, Res, ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FirewallsService } from './firewalls.service';
import { CreateFirewallDto, UpdateFirewallDto, FirewallQueryDto } from './firewalls.dto';
import { Roles } from '../index';
import { UserRole } from '../users/user.entity';
import { PendingChangeService } from '../pending-change/pending-changes.service';

@Controller('firewalls')
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class FirewallsController {
  constructor(
    private readonly firewallsService: FirewallsService,
    private readonly pendingChangeService: PendingChangeService,
  ) {}

  @Get('statistics')
  async getStatistics() {
    const data = await this.firewallsService.getStatistics();
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Get('dashboard-kpis')
  async getDashboardKpis() {
    const data = await this.firewallsService.getDashboardKpis();
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Get('export')
  async export(@Res() res: Response) {
    const buffer = await this.firewallsService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="firewalls_${new Date().toISOString().split('T')[0]}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('list')
  async getFirewalls(@Query() query: FirewallQueryDto) {
    const result = await this.firewallsService.findAll(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  @Get(':id')
  async getFirewall(@Param('id', ParseIntPipe) id: number) {
    const data = await this.firewallsService.findOne(id);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Post()
async store(@Body() dto: CreateFirewallDto, @Request() req) {
  const user = req.user;
  if (user.role === UserRole.ADMIN) {
    const data = await this.firewallsService.create(dto, user);
    return { success: true, message: 'Firewall créé avec succès', data };
  } else if (user.role === UserRole.AGENT) {
    const pending = await this.pendingChangeService.create({
      entity_type: 'firewall',
      entity_id: undefined,
      action: 'create',
      new_data: dto,
      old_data: undefined,
      requested_by_id: user.id,
    });
    return {
      success: true,
      message: 'Votre demande de création a été soumise à l’approbation d’un administrateur.',
      pending_id: pending.id,
    };
  }
  throw new ForbiddenException('Action non autorisée');
}

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFirewallDto,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role === UserRole.ADMIN) {
      const data = await this.firewallsService.update(id, dto, user);
      return { success: true, message: 'Firewall mis à jour avec succès', data };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.firewallsService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'firewall',
        entity_id: id,
        action: 'update',
        new_data: dto,
        old_data: current,
        requested_by_id: user.id,
      });
      return {
        success: true,
        message: 'Votre modification a été soumise à l’approbation d’un administrateur.',
        pending_id: pending.id,
      };
    }
    throw new ForbiddenException('Action non autorisée');
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = req.user;
    if (user.role === UserRole.ADMIN) {
      await this.firewallsService.remove(id, user);
      return { success: true, message: 'Firewall supprimé avec succès' };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.firewallsService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'firewall',
        entity_id: id,
        action: 'delete',
        new_data: undefined,
        old_data: current,
        requested_by_id: user.id,
      });
      return {
        success: true,
        message: 'Votre demande de suppression a été soumise à l’approbation.',
        pending_id: pending.id,
      };
    }
    throw new ForbiddenException('Action non autorisée');
  }

  @Post(':id/test-connectivity')
  async testConnectivity(@Param('id', ParseIntPipe) id: number) {
    const data = await this.firewallsService.testConnectivity(id);
    return { success: true, data, message: 'Test de connectivité terminé' };
  }

  @Post(':id/update-security-policies')
  async updateSecurityPolicies(
    @Param('id', ParseIntPipe) id: number,
    @Body('policies') policies: string,
    @Request() req,
  ) {
    const result = await this.firewallsService.updateSecurityPolicies(id, policies, req.user);
    return { success: true, message: 'Politiques de sécurité mises à jour', data: result };
  }
}