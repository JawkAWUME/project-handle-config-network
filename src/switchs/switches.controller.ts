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
  forwardRef,
  Inject,
} from '@nestjs/common';
import type { Response } from 'express';
import { SwitchesService } from './switches.service';
import { CreateSwitchDto, UpdateSwitchDto, SwitchQueryDto } from './switches.dto';
import { Roles } from '../index';
import { UserRole } from '../users/user.entity';
import { PendingChangeService } from '../pending-change/pending-changes.service';

@Controller('switches')
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class SwitchesController {
  constructor(
    private readonly switchesService: SwitchesService,
    @Inject(forwardRef(() => PendingChangeService))
    private readonly pendingChangeService: PendingChangeService,
  ) {}

  @Get()
  async index(@Query() query: SwitchQueryDto) {
    const result = await this.switchesService.findAll(query);
    return { success: true, ...result, timestamp: new Date().toISOString() };
  }

  @Get('export')
  async export(@Res() res: Response) {
    const buffer = await this.switchesService.exportToExcel();
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="switches_${new Date().toISOString().split('T')[0]}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('statistics')
  async statistics() {
    const stats = await this.switchesService.getStatistics();
    return { success: true, data: stats };
  }

  @Post()
async store(@Body() dto: CreateSwitchDto, @Request() req) {
  const user = req.user;
  if (user.role === UserRole.ADMIN) {
    const sw = await this.switchesService.create(dto, user);
    return { success: true, message: 'Switch créé avec succès', data: sw };
  } else if (user.role === UserRole.AGENT) {
    const pending = await this.pendingChangeService.create({
      entity_type: 'switch',
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

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    const sw = await this.switchesService.findOne(id);
    return { success: true, data: sw };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSwitchDto,
    @Request() req,
  ) {
    const user = req.user;
    if (user.role === UserRole.ADMIN) {
      const sw = await this.switchesService.update(id, dto, user);
      return { success: true, message: 'Switch mis à jour', data: sw };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.switchesService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'switch',
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
      await this.switchesService.remove(id, user);
      return { success: true, message: 'Switch supprimé avec succès' };
    } else if (user.role === UserRole.AGENT) {
      const current = await this.switchesService.findOne(id);
      const pending = await this.pendingChangeService.create({
        entity_type: 'switch',
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
    const backup = await this.switchesService.createBackup(id, req.user.sub);
    return { success: true, message: 'Backup créé', data: backup };
  }

  @Post(':id/port-configuration')
  async updatePorts(
    @Param('id', ParseIntPipe) id: number,
    @Body('configuration') configuration: string,
    @Request() req,
  ) {
    const result = await this.switchesService.updatePorts(id, configuration, req.user);
    return { success: true, message: 'Configuration des ports mise à jour', data: result };
  }
}