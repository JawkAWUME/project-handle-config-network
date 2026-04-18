import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site } from './site.entity';
import { PendingChangeService } from 'src/pending-change/pending-changes.service';
import { PendingChange } from 'src/pending-change/pending-change.entity';
import { RoutersService } from 'src/routers/routers.service';
import { FirewallsService } from 'src/firewalls/firewalls.service';
import { SwitchesService } from 'src/switchs/switches.service';
import { Switch } from 'src/switchs/switch.entity';
import { Router } from 'src/routers/router.entity';
import { Firewall } from 'src/firewalls/firewall.entity';
import { ConfigurationHistory } from 'src/config-history/config-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Site, PendingChange,Router, Firewall, Switch,ConfigurationHistory])],
  controllers: [SitesController],
  providers: [SitesService,PendingChangeService, RoutersService, FirewallsService, SwitchesService],
  exports: [SitesService,PendingChangeService],
})
export class SitesModule {}
