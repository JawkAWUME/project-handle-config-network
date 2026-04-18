import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Switch } from './switch.entity';
import { SwitchesService } from './switches.service';
import { SwitchesController } from './switches.controller';
import { ConfigHistoryModule } from '../config-history/config-history.module';
import { ConfigurationHistory } from '../config-history/config-history.entity';
import { PendingChangeService } from 'src/pending-change/pending-changes.service';
import { PendingChange } from 'src/pending-change/pending-change.entity';
import { RoutersModule } from 'src/routers/routers.module';
import { PendingChangeModule } from 'src/pending-change/pending-change.module';

@Module({
  imports: [TypeOrmModule.forFeature([Switch, ConfigurationHistory,PendingChange]),
 forwardRef(() => PendingChangeModule)],
  controllers: [SwitchesController],
  providers: [SwitchesService],
  exports: [SwitchesService],
})
export class SwitchesModule {}