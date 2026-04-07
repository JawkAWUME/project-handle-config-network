import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, ParseIntPipe, Request,
} from '@nestjs/common';
import { Roles } from '../index';
import { UserRole } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersService } from './users.service';

/**
 * Équivalent des routes api/users dans web.php :
 *   GET    /api/users/
 *   POST   /api/users/
 *   PUT    /api/users/{user}
 *   DELETE /api/users/{user}
 *   PATCH  /api/users/{user}/toggle-status
 */
@Controller('users')
@Roles(UserRole.ADMIN) // Toutes les routes users = admin only (équivalent UserPolicy)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async index() {
    const users = await this.usersService.findAll();
    return { success: true, data: users };
  }

  @Post()
  async store(@Body() dto: CreateUserDto, @Request() req) {
    const user = await this.usersService.create(dto, req.user);
    return { success: true, message: 'Utilisateur créé avec succès', data: user };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Request() req,
  ) {
    const user = await this.usersService.update(id, dto, req.user);
    return { success: true, message: 'Utilisateur mis à jour', data: user };
  }

  @Delete(':id')
  async destroy(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.usersService.remove(id, req.user);
    return { success: true, message: 'Utilisateur supprimé avec succès' };
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const user = await this.usersService.toggleStatus(id, req.user);
    return {
      success: true,
      message: `Utilisateur ${user.is_active ? 'activé' : 'désactivé'}`,
      data: user,
    };
  }
}
