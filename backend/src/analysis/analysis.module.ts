import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventCheckinAnalytics } from './entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from './entities/point-checkin-analytics.entity';
import { GuestModule } from 'src/guest/guest.module';
import { EventModule } from 'src/event/event.module';
import { PocModule } from 'src/poc/poc.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventCheckinAnalytics, PointCheckinAnalytics]),
    GuestModule,
    EventModule,
    PocModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
