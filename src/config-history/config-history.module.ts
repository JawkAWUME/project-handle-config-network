import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationHistory } from './config-history.entity';


@Module({
  imports: [TypeOrmModule.forFeature([ConfigurationHistory])],
//   controllers: [ConfigHistoryController],
//   providers: [ConfigHistoryService],
//   exports: [ConfigHistoryService],
})
export class ConfigHistoryModule {}