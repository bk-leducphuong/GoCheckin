import { Injectable, NotFoundException } from '@nestjs/common';
import { FloorPlan } from './entities/floor-plan.entity';
import { FloorPlanDto } from './dto/floor-plan.dto';
import { S3Service } from 'src/common/services/s3.service';
import {
  FloorPlanRepository,
  EventRepository,
  PocLocationRepository,
} from 'src/repositories';

@Injectable()
export class FloorPlanService {
  constructor(
    private readonly floorPlanRepository: FloorPlanRepository,
    private readonly s3Service: S3Service,
    private readonly eventRepository: EventRepository,
    private readonly pocLocationRepository: PocLocationRepository,
  ) {}

  async getFloorPlanByEventCode(eventCode: string): Promise<FloorPlan> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const floorPlan = await this.floorPlanRepository.findOne({
        eventId: event.eventId,
      });

      if (!floorPlan) {
        throw new NotFoundException('Floor plan not found');
      }

      return floorPlan;
    } catch (error) {
      console.error('Error getting floor plan by event code:', error);
      throw error;
    }
  }

  async uploadFloorPlan(
    eventCode: string,
    image: Express.Multer.File,
  ): Promise<string> {
    try {
      // Upload to S3 instead of local filesystem
      const key = await this.s3Service.uploadFile(
        image,
        `floor-plans/${eventCode}`,
      );
      return key;
    } catch (error) {
      console.error('Error uploading floor plan:', error);
      throw error;
    }
  }

  async saveFloorPlan(floorPlanDto: FloorPlanDto) {
    try {
      const { eventCode, floorPlanImageUrl } = floorPlanDto;
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }

      const floorPlan = await this.floorPlanRepository.findOne({
        eventId: event.eventId,
      });
      if (floorPlan) {
        await this.removeFloorPlan(eventCode);
      }

      const newFloorPlan = this.floorPlanRepository.create({
        eventId: event.eventId,
        floorPlanImageUrl: floorPlanImageUrl,
      });
      await this.floorPlanRepository.save(newFloorPlan);
    } catch (error) {
      console.error('Error saving floor plan:', error);
      throw error;
    }
  }

  async getFloorPlanImage(eventCode: string): Promise<string> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const floorPlan = await this.floorPlanRepository.findOne({
        eventId: event.eventId,
      });

      if (!floorPlan) {
        throw new NotFoundException('Floor plan not found');
      }

      // Return the S3 URL instead of local file path
      return this.s3Service.getFileUrl(floorPlan.floorPlanImageUrl);
    } catch (error) {
      console.error('Error getting floor plan image:', error);
      throw error;
    }
  }

  async removeFloorPlan(eventCode: string): Promise<void> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });
      if (!event) {
        throw new NotFoundException('Event not found');
      }
      const floorPlan = await this.floorPlanRepository.findOne({
        eventId: event.eventId,
      });

      if (floorPlan) {
        await this.pocLocationRepository.delete({
          floorPlanId: floorPlan.floorPlanId,
        }); // hard delete

        // Delete from S3 instead of local filesystem
        await this.s3Service.deleteFile(floorPlan.floorPlanImageUrl);
        await this.floorPlanRepository.remove(floorPlan);
      }
    } catch (error) {
      console.error('Error removing floor plan:', error);
      throw error;
    }
  }
}
