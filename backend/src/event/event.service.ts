import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { FindOptionsWhere, In } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRepository } from '../repositories/event.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { EventStatus } from './entities/event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { S3Service } from '../common/services/s3.service';
import { EventConstraintsDto } from './dto/event-constraints';
import { DataSource } from 'typeorm';

@Injectable()
export class EventService {
  constructor(
    private readonly eventRepository: EventRepository,
    private readonly s3Service: S3Service,
    private readonly dataSource: DataSource,
  ) {}

  private readonly logger = new Logger('EventService');

  async validateEventCode(eventCode: string): Promise<boolean> {
    const event = await this.eventRepository.findOne({
      eventCode: eventCode,
    });
    return !!event;
  }

  async findEventsByConstraints(
    constraints: EventConstraintsDto,
  ): Promise<Event[]> {
    try {
      const whereConditions: FindOptionsWhere<Event> = {};

      if (constraints.eventStatus !== undefined) {
        whereConditions.eventStatus = constraints.eventStatus;
      }

      if (constraints.eventType !== undefined) {
        whereConditions.eventType = constraints.eventType;
      }

      const events = await this.eventRepository.findAll(whereConditions);
      return events.map((event) => {
        if (event.images) {
          event.images = event.images.map((key) =>
            this.s3Service.getFileUrl(key),
          );
        }
        return event;
      });
    } catch (error) {
      console.error('Error finding all events:', error);
      throw error;
    }
  }

  async createEvent(
    user: JwtPayload,
    newEventData: CreateEventDto,
  ): Promise<Event> {
    try {
      const newEvent: Event = await this.eventRepository.create({
        ...newEventData,
        userId: user.userId,
        eventStatus: EventStatus.PUBLISHED,
      });
      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getAllManagedEvents(user: JwtPayload): Promise<Event[]> {
    try {
      const events = await this.eventRepository.findAll({
        userId: user.userId,
      });
      return events.map((event) => {
        if (event.images) {
          event.images = event.images.map((key) =>
            this.s3Service.getFileUrl(key),
          );
        }
        return event;
      });
    } catch (error) {
      console.error('Error finding all events:', error);
      throw error;
    }
  }

  async getEventByCode(eventCode: string): Promise<Event> {
    try {
      const event = await this.eventRepository.findOne({
        eventCode: eventCode,
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${eventCode} not found`);
      }

      if (event.images) {
        event.images = event.images.map((key) =>
          this.s3Service.getFileUrl(key),
        );
      }

      return event;
    } catch (error) {
      console.error('Error finding event:', error);
      throw error;
    }
  }

  async updateEvent(
    eventCode: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    try {
      const updatedEvent: Event = await this.eventRepository.update(
        eventCode,
        updateEventDto,
      );
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async removeEvent(eventCode: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const event = await this.eventRepository.findOne({ eventCode });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      await queryRunner.manager.delete('FloorPlan', { eventId: event.eventId });
      await queryRunner.manager.delete('PocInvite', { eventId: event.eventId });
      await queryRunner.manager.delete('GuestCheckin', {
        eventId: event.eventId,
      });
      await queryRunner.manager.delete('PointCheckinAnalytics', {
        eventId: event.eventId,
      });
      await queryRunner.manager.delete('EventCheckinAnalytics', {
        eventId: event.eventId,
      });
      await queryRunner.manager.delete('Event', { eventId: event.eventId });
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error removing event:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getEventStatus(eventCode: string): Promise<EventStatus> {
    try {
      const event = await this.eventRepository.findOne({ eventCode });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }
      return event.eventStatus;
    } catch (error) {
      console.error('Error getting event status:', error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateEventStatus() {
    try {
      const events = await this.eventRepository.findAll({
        eventStatus: In([EventStatus.ACTIVE, EventStatus.PUBLISHED]),
      });

      for (const event of events) {
        const startTime = new Date(event.startTime).getTime();
        const endTime = new Date(event.endTime).getTime();
        const now = new Date().getTime();

        if (now >= startTime && now <= endTime) {
          event.eventStatus = EventStatus.ACTIVE;
        } else if (now > endTime) {
          event.eventStatus = EventStatus.COMPLETED;
        }
        await this.eventRepository.update(event.eventCode, {
          eventStatus: event.eventStatus,
        });
      }
    } catch (error) {
      console.error('Error updating event status:', error);
      throw error;
    }
  }

  async uploadEventImages(
    eventCode: string,
    images: Array<Express.Multer.File>,
  ): Promise<string[]> {
    try {
      const event = await this.eventRepository.findOne({ eventCode });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      const uploadedImages: Array<string> = [];

      for (const image of images) {
        const key = await this.s3Service.uploadFile(
          image,
          `events/${eventCode}`,
        );
        uploadedImages.push(key);
      }

      // Save the S3 keys to the event
      event.images = [...(event.images || []), ...uploadedImages];
      await this.eventRepository.update(eventCode, { images: event.images });

      // Return array of URLs if needed
      return uploadedImages;
    } catch (error) {
      console.error('Error uploading event images:', error);
      throw error;
    }
  }

  // Update getEventImages to use S3
  async getEventImages(eventCode: string): Promise<string[]> {
    try {
      const event = await this.eventRepository.findOne({ eventCode });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      return event.images.map((key) => this.s3Service.getFileUrl(key));
    } catch (error) {
      console.error('Error getting event images:', error);
      throw error;
    }
  }

  // Delete image files
  async deleteEventImages(eventCode: string) {
    try {
      const event = await this.eventRepository.findOne({ eventCode });
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      for (const imageKey of event.images) {
        await this.s3Service.deleteFile(imageKey);
      }

      await this.eventRepository.update(eventCode, { images: [] });
    } catch (error) {
      console.error('Error deleting event images:', error);
      throw error;
    }
  }
}
