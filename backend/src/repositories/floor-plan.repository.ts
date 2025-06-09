import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { FloorPlan } from '../floor-plan/entities';

@Injectable()
export class FloorPlanRepository {
  constructor(
    @InjectRepository(FloorPlan)
    private readonly floorPlanRepository: Repository<FloorPlan>,
  ) {}

  async findOne(where: FindOptionsWhere<FloorPlan>): Promise<FloorPlan | null> {
    try {
      return await this.floorPlanRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<FloorPlan>): FloorPlan {
    try {
      return this.floorPlanRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(floorPlan: FloorPlan): Promise<FloorPlan> {
    try {
      return await this.floorPlanRepository.save(floorPlan);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(floorPlan: FloorPlan): Promise<void> {
    try {
      await this.floorPlanRepository.remove(floorPlan);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
