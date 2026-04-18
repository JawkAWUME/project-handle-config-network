import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallsController } from './firewalls.controller';
import { FirewallsService } from './firewalls.service';
import { Firewall } from './firewall.entity';
import { ConfigurationHistory } from '../config-history/config-history.entity';
import { PendingChangeService } from 'src/pending-change/pending-changes.service';
import { PendingChange } from 'src/pending-change/pending-change.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Firewall, ConfigurationHistory,PendingChange])],
  controllers: [FirewallsController],
  providers: [FirewallsService,PendingChangeService],
  exports: [FirewallsService,PendingChangeService],
})
export class FirewallsModule {}