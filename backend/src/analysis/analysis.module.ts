import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventCheckinAnalytics } from './entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from './entities/point-checkin-analytics.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventCheckinAnalytics, PointCheckinAnalytics]),
    // Add other modules that AnalysisService might depend on here
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
