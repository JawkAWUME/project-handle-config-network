import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Router } from './router.entity';
import { RoutersService } from './routers.service';
import { RoutersController } from './routers.controller';
import { ConfigHistoryModule } from '../config-history/config-history.module';
import { ConfigurationHistory } from '../config-history/config-history.entity';
import { PendingChange } from 'src/pending-change/pending-change.entity';
import { PendingChangeService } from 'src/pending-change/pending-changes.service';
import { FirewallsModule } from 'src/firewalls/firewalls.module';
import { SitesModule } from 'src/sites/sites.module';
import { SwitchesModule } from 'src/switchs/switch.module';

@Module({
  imports: [TypeOrmModule.forFeature([Router, ConfigurationHistory,PendingChange])],
  controllers: [RoutersController],
  providers: [RoutersService],
  exports: [RoutersService],
})
export class RoutersModule {}