import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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

  async uploadFloorPlanImage(image: Express.Multer.File): Promise<string> {
    if (!image) {
      throw new BadRequestException('No image file provided');
    }

    // Validate file type
    if (!image.mimetype.startsWith('image/')) {
      throw new BadRequestException('File must be an image');
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (image.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Ensure uploads directory exists
    const uploadsDir = join(__dirname, '..', '..', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    return image.filename;
    throw new Error('Failed to process floor plan image');
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
