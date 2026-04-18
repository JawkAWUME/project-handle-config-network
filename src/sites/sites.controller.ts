import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, Request, Res, ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto, SearchSiteDto } from './sites.dto';
import { Roles } from '../index';
import { UserRole } from '../users/user.entity';
import { PendingChangeService } from '../pending-change/pending-changes.service';

@Controller('sites')
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class SitesController {
  constructor(
    private readonly sitesService: SitesService,
    @Inject(forwardRef(() => PendingChangeService))
    private readonly pendingChangeService: PendingChangeService,
  ) {}

  @Get('list')
  async getSites(@Query() query: SearchSiteDto) {
    const result = await this.sitesService.findAll(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  @Get('export')
  async export(@Res() res: Response) {
    const buffer = await this.sitesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="sites_${new Date().toISOString().split('T')[0]}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get(':id')
  async getSite(@Param('id', ParseIntPipe) id: number) {
    const site = await this.sitesService.findOne(id);
    return { success: true, data: site, timestamp: new Date().toISOString() };
  }

  @Post()
  async store(@Body() dto: CreateSiteDto, @Request() req) {
    const site = await this.sitesService.create(dto, req.user);
    return { success: true, message: 'Site créé avec succès', data: site };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSiteDto,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role === UserRole.ADMIN) {
      const site = await this.sitesService.update(id, dto, user);
      return { success: true, message: 'Site mis à jour', data: site };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.sitesService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'site',
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
      await this.sitesService.remove(id, user);
      return { success: true, message: 'Site supprimé avec succès' };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.sitesService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'site',
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
}