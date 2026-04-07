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
import { RoutersService } from './routers.service';
import { CreateRouterDto, UpdateRouterDto, RouterQueryDto } from './routers.dto';
import { Roles } from '../index';
import { UserRole } from '../users/user.entity';

@Controller('routers')
@Roles(UserRole.ADMIN, UserRole.AGENT)
export class RoutersController {
  constructor(private readonly routersService: RoutersService) {}

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
    const router = await this.routersService.create(dto, req.user);
    return { success: true, message: 'Routeur créé avec succès', data: router };
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
    const router = await this.routersService.update(id, dto, req.user);
    return { success: true, message: 'Routeur mis à jour', data: router };
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.routersService.remove(id, req.user);
    return { success: true, message: 'Routeur supprimé avec succès' };
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

    // Ajouter dans RoutersController
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