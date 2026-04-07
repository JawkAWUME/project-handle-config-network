import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirewallsController } from './firewalls.controller';
import { FirewallsService } from './firewalls.service';
import { Firewall } from './firewall.entity';
import { ConfigurationHistory } from '../config-history/config-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Firewall, ConfigurationHistory])],
  controllers: [FirewallsController],
  providers: [FirewallsService],
  exports: [FirewallsService],
})
export class FirewallsModule {}