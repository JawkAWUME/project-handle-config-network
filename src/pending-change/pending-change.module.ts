// pending-change/pending-change.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingChange } from './pending-change.entity';
import { PendingChangeService } from './pending-changes.service';
import { PendingChangesController } from './pending-changes.controller';
// Importez les modules des entités concernées (pour les services create/update)
import { RoutersModule } from '../routers/routers.module';
import { FirewallsModule } from '../firewalls/firewalls.module';
import { SwitchesModule } from '../switchs/switch.module';
import { SitesModule } from '../sites/sites.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendingChange]),
    RoutersModule,
    FirewallsModule,
    SwitchesModule,
    SitesModule,
  ],
  controllers: [PendingChangesController],
  providers: [PendingChangeService],
  exports: [PendingChangeService],
})
export class PendingChangeModule {}