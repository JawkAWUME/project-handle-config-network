import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Request,
  Res,
  ForbiddenException,
} from '@nestjs/common';
import type { Response } from 'express';
import { RoutersService } from './routers.service';
import { CreateRouterDto, UpdateRouterDto, RouterQueryDto } from './routers.dto';
import { Roles } from '../index';
import { UserRole } from '../users/user.entity';
import { PendingChangeService } from '../pending-change/pending-changes.service';
import { ChangeAction } from '../pending-change/pending-change.entity';

@Controller('routers')
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class RoutersController {
  constructor(
    private readonly routersService: RoutersService,
    private readonly pendingChangeService: PendingChangeService,
  ) {}

  @Get()
  async index(@Query() query: RouterQueryDto) {
    const result = await this.routersService.findAll(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  @Get('export')
  async export(@Res() res: Response) {
    const buffer = await this.routersService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="routeurs_${new Date().toISOString().split('T')[0]}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('statistics')
  async statistics() {
    const stats = await this.routersService.getStatistics();
    return { success: true, data: stats };
  }

  @Post()
async store(@Body() dto: CreateRouterDto, @Request() req) {
  const user = req.user;
  if (user.role === UserRole.ADMIN) {
    // Création directe
    const router = await this.routersService.create(dto, user);
    return { success: true, message: 'Routeur créé avec succès', data: router };
  } else if (user.role === UserRole.AGENT) {
    // Création d'une demande de modération (action = 'create')
    const pending = await this.pendingChangeService.create({
      entity_type: 'router',
      entity_id: undefined, // pas encore d'ID
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

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    const router = await this.routersService.findOne(id);
    return { success: true, data: router };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRouterDto,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role === UserRole.ADMIN) {
      // Application directe
      const router = await this.routersService.update(id, dto, user);
      return { success: true, message: 'Routeur mis à jour', data: router };
    } else if (user.role === UserRole.AGENT) {
      // Récupération de l'état actuel (optionnel)
      const current = await this.routersService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'router',
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
      await this.routersService.remove(id, user);
      return { success: true, message: 'Routeur supprimé avec succès' };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.routersService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'router',
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

  @Post(':id/backup')
  async backup(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const backup = await this.routersService.createBackup(id, req.user.sub);
    return { success: true, message: 'Backup créé', data: backup };
  }

  @Post(':id/restore/:backupId')
  async restore(
    @Param('id', ParseIntPipe) id: number,
    @Param('backupId', ParseIntPipe) backupId: number,
    @Request() req,
  ) {
    const restore = await this.routersService.restoreFromBackup(id, backupId, req.user.sub);
    return { success: true, message: 'Configuration restaurée', data: restore };
  }

  @Post(':id/update-interfaces')
  async updateInterfaces(
    @Param('id', ParseIntPipe) id: number,
    @Body('interfacesConfig') interfacesConfig: string,
    @Request() req,
  ) {
    const result = await this.routersService.updateInterfaces(id, interfacesConfig, req.user);
    return { success: true, message: 'Interfaces mises à jour', data: result };
  }
}