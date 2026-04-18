import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';
import { Site } from './site.entity';
import { PendingChangeService } from 'src/pending-change/pending-changes.service';
import { PendingChange } from 'src/pending-change/pending-change.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Site, PendingChange])],
  controllers: [SitesController],
  providers: [SitesService,PendingChangeService],
  exports: [SitesService,PendingChangeService],
})
export class SitesModule {}
