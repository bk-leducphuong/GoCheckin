import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointCheckinAnalytics } from '../analysis/entities/point-checkin-analytics.entity';
import { Event } from 'src/event/entities/event.entity';

@Injectable()
export class PointCheckinAnalysisRepository {
  constructor(
    @InjectRepository(PointCheckinAnalytics)
    private readonly pointCheckinAnalyticsRepository: Repository<PointCheckinAnalytics>,
  ) {}

  async findByEventCode(eventCode: string): Promise<PointCheckinAnalytics[]> {
    try {
      const analytics = await this.pointCheckinAnalyticsRepository
        .createQueryBuilder('point_checkin_analytics')
        .leftJoin(
          Event,
          'event',
          'event.eventCode = point_checkin_analytics.event_code',
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
    pointCode: string,
    data: Partial<PointCheckinAnalytics>,
  ): PointCheckinAnalytics {
    try {
      return this.pointCheckinAnalyticsRepository.create({
        ...data,
        event: { eventCode },
        point: { pointCode },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(analytic: PointCheckinAnalytics): Promise<PointCheckinAnalytics> {
    try {
      return await this.pointCheckinAnalyticsRepository.save(analytic);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
