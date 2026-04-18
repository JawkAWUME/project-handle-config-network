import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingChange } from './pending-change.entity';
import { PendingChangeService } from './pending-changes.service';
import { PendingChangesController } from './pending-changes.controller';

import { RoutersModule } from '../routers/routers.module';
import { FirewallsModule } from '../firewalls/firewalls.module';
import { SwitchesModule } from '../switchs/switch.module';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingChange]),
    forwardRef(() => RoutersModule),
    forwardRef(() => FirewallsModule),
    forwardRef(() => SwitchesModule),
    forwardRef(() => SitesModule),
  ],
  controllers: [PendingChangesController],
  providers: [PendingChangeService],
  exports: [PendingChangeService],
})
export class PendingChangeModule {}