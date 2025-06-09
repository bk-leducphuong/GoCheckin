import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { EventCheckinAnalytics } from '../analysis/entities';

@Injectable()
export class EventCheckinAnalysisRepository {
  constructor(
    @InjectRepository(EventCheckinAnalytics)
    private readonly eventCheckinAnalyticsRepository: Repository<EventCheckinAnalytics>,
  ) {}

  async findOne(
    where: FindOptionsWhere<EventCheckinAnalytics>,
  ): Promise<EventCheckinAnalytics | null> {
    try {
      return await this.eventCheckinAnalyticsRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(
    where: FindOptionsWhere<EventCheckinAnalytics>,
  ): Promise<EventCheckinAnalytics[]> {
    try {
      return await this.eventCheckinAnalyticsRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(
    eventId: string,
    data: Partial<EventCheckinAnalytics>,
  ): EventCheckinAnalytics {
    try {
      return this.eventCheckinAnalyticsRepository.create({
        ...data,
        eventId: eventId,
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
