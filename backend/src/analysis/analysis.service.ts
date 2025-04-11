import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCheckinAnalytics } from './entities/event-checkin-analytics.entity';
import { PointCheckinAnalytics } from './entities/point-checkin-analytics.entity';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(EventCheckinAnalytics)
    private eventCheckinAnalyticsRepository: Repository<EventCheckinAnalytics>,
    @InjectRepository(PointCheckinAnalytics)
    private pointCheckinAnalyticsRepository: Repository<PointCheckinAnalytics>,
  ) {}
}
