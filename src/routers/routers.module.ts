import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Router } from './router.entity';
import { RoutersService } from './routers.service';
import { RoutersController } from './routers.controller';
import { ConfigHistoryModule } from '../config-history/config-history.module';
import { ConfigurationHistory } from '../config-history/config-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Router, ConfigurationHistory])],
  controllers: [RoutersController],
  providers: [RoutersService],
  exports: [RoutersService],
})
export class RoutersModule {}