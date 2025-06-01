import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PointOfCheckin } from '../poc/entities/poc.entity';

@Injectable()
export class PocRepository {
  constructor(
    @InjectRepository(PointOfCheckin)
    private readonly pocRepository: Repository<PointOfCheckin>,
  ) {}

  async findByPointCodeAndEvent(
    pointCode: string,
    eventCode: string,
  ): Promise<PointOfCheckin | null> {
    try {
      return await this.pocRepository.findOne({
        where: {
          pointCode: pointCode,
          eventCode: eventCode,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByPointCodeAndEventWithRelations(
    eventCode: string,
    pointCode: string,
  ): Promise<PointOfCheckin | null> {
    try {
      return await this.pocRepository.findOne({
        where: { eventCode, pointCode },
        relations: ['account', 'event'],
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<PointOfCheckin>): PointOfCheckin {
    try {
      return this.pocRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(poc: PointOfCheckin): Promise<PointOfCheckin> {
    try {
      return await this.pocRepository.save(poc);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByEventCode(eventCode: string): Promise<PointOfCheckin[]> {
    try {
      return await this.pocRepository.find({
        where: { eventCode },
        relations: ['account'],
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByPocId(pocId: string): Promise<PointOfCheckin | null> {
    try {
      return await this.pocRepository.findOne({
        where: { pocId },
        relations: ['account', 'event'],
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<PointOfCheckin[]> {
    try {
      return await this.pocRepository.find({
        where: { userId },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByUserAndEventAndPoint(
    userId: string,
    eventCode: string,
    pointCode: string,
  ): Promise<PointOfCheckin | null> {
    try {
      return await this.pocRepository.findOne({
        where: { userId, eventCode, pointCode },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    conditions: Partial<PointOfCheckin>,
    data: Partial<PointOfCheckin>,
  ): Promise<void> {
    try {
      await this.pocRepository.update(conditions, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteByEventCode(eventCode: string): Promise<void> {
    try {
      await this.pocRepository.delete({ eventCode });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteByPocId(pocId: string): Promise<void> {
    try {
      await this.pocRepository.delete({ pocId });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
