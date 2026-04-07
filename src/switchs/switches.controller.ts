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
} from '@nestjs/common';
import type { Response } from 'express';
import { SwitchesService } from './switches.service';
import { CreateSwitchDto, UpdateSwitchDto, SwitchQueryDto } from './switches.dto';
import { Roles } from '../index';
import { UserRole } from '../users/user.entity';

@Controller('switches')
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class SwitchesController {
  constructor(private readonly switchesService: SwitchesService) {}

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
    const sw = await this.switchesService.create(dto, req.user);
    return { success: true, message: 'Switch créé avec succès', data: sw };
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
    const sw = await this.switchesService.update(id, dto, req.user);
    return { success: true, message: 'Switch mis à jour', data: sw };
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.switchesService.remove(id, req.user);
    return { success: true, message: 'Switch supprimé avec succès' };
  }

  @Post(':id/backup')
  async backup(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const backup = await this.switchesService.createBackup(id, req.user.sub);
    return { success: true, message: 'Backup créé', data: backup };
  }

  // Ajouter cette méthode après les routes existantes
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