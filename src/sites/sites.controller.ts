import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, Request, Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { SitesService } from './sites.service';
import { CreateSiteDto, UpdateSiteDto } from './sites.dto';

/**
 * Équivalent des routes api/sites dans web.php :
 *   GET    /api/sites/list
 *   GET    /api/sites/:id
 *   POST   /api/sites/
 *   PUT    /api/sites/:id
 *   DELETE /api/sites/:id
 *   GET    /api/sites/export  (Excel)
 */
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get('list')
  async getSites(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('limit') limit?: number,
  ) {
    const result = await this.sitesService.findAll({ search, status, city, country, limit });
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
    const site = await this.sitesService.update(id, dto, req.user);
    return { success: true, message: 'Site mis à jour', data: site };
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.sitesService.remove(id, req.user);
    return { success: true, message: 'Site supprimé avec succès' };
  }
}