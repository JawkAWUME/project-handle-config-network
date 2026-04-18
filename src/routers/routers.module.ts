import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Router } from './router.entity';
import { RoutersService } from './routers.service';
import { RoutersController } from './routers.controller';
import { ConfigurationHistory } from '../config-history/config-history.entity';
import { PendingChange } from '../pending-change/pending-change.entity';
import { PendingChangeService } from '../pending-change/pending-changes.service';
import { PendingChangeModule } from '../pending-change/pending-change.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Router, ConfigurationHistory, PendingChange]),
    forwardRef(() => PendingChangeModule),
  ],
  controllers: [RoutersController],
  providers: [RoutersService],
  exports: [RoutersService],
})
export class RoutersModule {}