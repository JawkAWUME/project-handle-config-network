import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Switch } from './switch.entity';
import { SwitchesService } from './switches.service';
import { SwitchesController } from './switches.controller';
import { ConfigHistoryModule } from '../config-history/config-history.module';
import { ConfigurationHistory } from '../config-history/config-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Switch, ConfigurationHistory])],
  controllers: [SwitchesController],
  providers: [SwitchesService],
  exports: [SwitchesService],
})
export class SwitchesModule {}