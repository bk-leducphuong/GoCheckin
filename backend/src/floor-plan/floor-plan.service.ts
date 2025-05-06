import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorPlan } from './entities/floor-plan.entity';
import { FloorPlanDto } from './dto/floor-plan.dto';
import { join } from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class FloorPlanService {
  constructor(
    @InjectRepository(FloorPlan)
    private readonly floorPlanRepository: Repository<FloorPlan>,
  ) {}

  async getFloorPlanByEventCode(eventCode: string): Promise<FloorPlan> {
    const floorPlan = await this.floorPlanRepository.findOne({
      where: { eventCode },
    });

    if (!floorPlan) {
      throw new NotFoundException('Floor plan not found');
    }

    return floorPlan;
  }

  async saveFloorPlan(floorPlan: FloorPlanDto) {
    const newFloorPlan = this.floorPlanRepository.create(floorPlan);
    await this.floorPlanRepository.save(newFloorPlan);
  }

  async getFloorPlanImage(eventCode: string): Promise<string> {
    const floorPlan = await this.floorPlanRepository.findOne({
      where: { eventCode },
    });

    if (!floorPlan) {
      throw new NotFoundException('Floor plan not found');
    }

    const imagePath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      floorPlan.floorPlanImageUrl,
    );
    return imagePath;
  }

  async removeFloorPlan(eventCode: string): Promise<void> {
    const floorPlan = await this.floorPlanRepository.findOne({
      where: { eventCode },
    });

    if (!floorPlan) {
      throw new NotFoundException('Floor plan not found');
    }

    const imagePath = join(
      __dirname,
      '..',
      '..',
      'uploads',
      floorPlan.floorPlanImageUrl,
    );
    await fs.unlink(imagePath);

    await this.floorPlanRepository.remove(floorPlan);
  }
}
