import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCheckinAnalytics } from '../analysis/entities/event-checkin-analytics.entity';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class EventCheckinAnalysisRepository {
  constructor(
    @InjectRepository(EventCheckinAnalytics)
    private readonly eventCheckinAnalyticsRepository: Repository<EventCheckinAnalytics>,
  ) {}

  async findByEventCode(eventCode: string): Promise<EventCheckinAnalytics[]> {
    try {
      const analytics = await this.eventCheckinAnalyticsRepository
        .createQueryBuilder('event_checkin_analytics')
        .leftJoin(
          Event,
          'event',
          'event.eventCode = event_checkin_analytics.event_code',
        )
        .where('event.eventCode = :eventCode', { eventCode })
        .getMany();

      return analytics;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(
    eventCode: string,
    data: Partial<EventCheckinAnalytics>,
  ): EventCheckinAnalytics {
    try {
      return this.eventCheckinAnalyticsRepository.create({
        ...data,
        event: { eventCode },
      });
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
