import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, Request, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { FirewallsService } from './firewalls.service';
import { CreateFirewallDto, UpdateFirewallDto } from './firewalls.dto';

/**
 * Équivalent des routes api/firewalls dans web.php
 * Toutes les routes requièrent auth (JwtAuthGuard global)
 *
 * GET    /api/firewalls/statistics
 * GET    /api/firewalls/list
 * GET    /api/firewalls/dashboard-kpis
 * GET    /api/firewalls/:id
 * POST   /api/firewalls/
 * PUT    /api/firewalls/:id
 * DELETE /api/firewalls/:id
 * POST   /api/firewalls/:id/test-connectivity
 * GET    /api/firewalls/export
 */
@Controller('firewalls')
export class FirewallsController {
  constructor(private readonly firewallsService: FirewallsService) {}

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
  async getFirewalls(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('brand') brand?: string,
    @Query('site_id') site_id?: number,
    @Query('firewall_type') firewall_type?: string,
    @Query('limit') limit?: number,
  ) {
    const result = await this.firewallsService.findAll({
      search, status, brand, site_id, firewall_type, limit,
    });
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  @Get(':id')
  async getFirewall(@Param('id', ParseIntPipe) id: number) {
    const data = await this.firewallsService.findOne(id);
    return { success: true, data, timestamp: new Date().toISOString() };
  }

  @Post()
  async store(@Body() dto: CreateFirewallDto, @Request() req) {
    const data = await this.firewallsService.create(dto, req.user);
    return { success: true, message: 'Firewall créé avec succès', data };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFirewallDto,
    @Request() req,
  ) {
    const data = await this.firewallsService.update(id, dto, req.user);
    return { success: true, message: 'Firewall mis à jour avec succès', data };
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.firewallsService.remove(id, req.user);
    return { success: true, message: 'Firewall supprimé avec succès' };
  }

  @Post(':id/test-connectivity')
  async testConnectivity(@Param('id', ParseIntPipe) id: number) {
    const data = await this.firewallsService.testConnectivity(id);
    return { success: true, data, message: 'Test de connectivité terminé' };
  }

  // Ajouter dans FirewallsController
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
