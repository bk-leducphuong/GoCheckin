import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PointCheckinAnalytics } from '../analysis/entities/point-checkin-analytics.entity';

@Injectable()
export class PointCheckinAnalysisRepository {
  constructor(
    @InjectRepository(PointCheckinAnalytics)
    private readonly pointCheckinAnalyticsRepository: Repository<PointCheckinAnalytics>,
  ) {}

  async findOne(
    where: FindOptionsWhere<PointCheckinAnalytics>,
  ): Promise<PointCheckinAnalytics | null> {
    try {
      return await this.pointCheckinAnalyticsRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(
    where: FindOptionsWhere<PointCheckinAnalytics>,
  ): Promise<PointCheckinAnalytics[]> {
    try {
      return await this.pointCheckinAnalyticsRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<PointCheckinAnalytics>): PointCheckinAnalytics {
    try {
      return this.pointCheckinAnalyticsRepository.create(data);
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
