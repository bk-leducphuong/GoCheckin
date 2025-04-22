import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FloorPlan } from './entities/floor-plan.entity';

@Injectable()
export class FloorPlanService {
  constructor(
    @InjectRepository(FloorPlan)
    private readonly floorPlanRepository: Repository<FloorPlan>,
  ) {}

  uploadFloorPlanImage(image: Express.Multer.File): string {
    return image.path;
  }

  async saveFloorPlan(eventCode: string, floorPlanImageUrl: string) {
    const floorPlan = this.floorPlanRepository.create({
      eventCode,
      floorPlanImageUrl,
    });
    return this.floorPlanRepository.save(floorPlan);
  }
}
