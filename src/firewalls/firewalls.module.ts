import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallsController } from './firewalls.controller';
import { FirewallsService } from './firewalls.service';
import { Firewall } from './firewall.entity';
import { ConfigurationHistory } from '../config-history/config-history.entity';
import { PendingChangeService } from 'src/pending-change/pending-changes.service';
import { PendingChange } from 'src/pending-change/pending-change.entity';
import { RoutersService } from 'src/routers/routers.service';
import { SwitchesService } from 'src/switchs/switches.service';
import { SitesService } from 'src/sites/sites.service';
import { RoutersModule } from 'src/routers/routers.module';


@Module({
  imports: [TypeOrmModule.forFeature([Firewall, ConfigurationHistory,PendingChange])],
  controllers: [FirewallsController],
  providers: [FirewallsService],
  exports: [FirewallsService],
})
export class FirewallsModule {}