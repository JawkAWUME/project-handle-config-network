import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLog } from './access-log.entity';
import { AccessLogsService } from './access-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog])],
  providers: [AccessLogsService],
  exports: [AccessLogsService],
})
export class AccessLogsModule {}