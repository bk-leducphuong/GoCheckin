import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PocLocation } from '../poc/entities/poc-location.entity';

@Injectable()
export class PocLocationRepository {
  constructor(
    @InjectRepository(PocLocation)
    private readonly pocLocationRepository: Repository<PocLocation>,
  ) {}

  async saveMultiple(
    locations: Partial<PocLocation>[],
  ): Promise<PocLocation[]> {
    try {
      return await this.pocLocationRepository.save(locations);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByFloorPlanId(floorPlanId: string): Promise<PocLocation[]> {
    try {
      return await this.pocLocationRepository.find({
        where: { floorPlanId: floorPlanId },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteByFloorPlanId(floorPlanId: string): Promise<void> {
    try {
      await this.pocLocationRepository.delete({ floorPlanId });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
