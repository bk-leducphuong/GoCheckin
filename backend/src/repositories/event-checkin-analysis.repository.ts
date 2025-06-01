import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCheckinAnalytics } from '../analysis/entities/event-checkin-analytics.entity';

@Injectable()
export class EventCheckinAnalysisRepository {
  constructor(
    @InjectRepository(EventCheckinAnalytics)
    private readonly eventCheckinAnalyticsRepository: Repository<EventCheckinAnalytics>,
  ) {}

  async findByEventCode(eventCode: string): Promise<EventCheckinAnalytics[]> {
    try {
      return await this.eventCheckinAnalyticsRepository.find({
        where: { eventCode },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<EventCheckinAnalytics>): EventCheckinAnalytics {
    try {
      return this.eventCheckinAnalyticsRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(analytic: EventCheckinAnalytics): Promise<EventCheckinAnalytics> {
    try {
      return await this.eventCheckinAnalyticsRepository.save(analytic);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
