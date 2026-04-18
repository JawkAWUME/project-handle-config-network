import {
  Controller, Get, Post,
  Body, Param, ParseIntPipe, Request
} from '@nestjs/common';
import { Roles } from "src";
import { UserRole } from "src/users/user.entity";
import { PendingChangeService } from "./pending-changes.service";

// pending-changes.controller.ts
@Controller('admin/pending-changes')
@Roles(UserRole.ADMIN)
export class PendingChangesController {
  constructor(private pendingService: PendingChangeService) {}

  @Get()
  async list() {
    const changes = await this.pendingService.findAllPending();
    return { success: true, data: changes };
  }

  @Post(':id/approve')
  async approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.pendingService.approve(id, req.user.id);
    return { success: true, message: 'Modification approuvée et appliquée.' };
  }

  @Post(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    await this.pendingService.reject(id, req.user.id, reason);
    return { success: true, message: 'Modification rejetée.' };
  }
}