import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Event } from './entities/event.entity';
import { AccountTenant } from 'src/account/entities/account-tenant.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { EventStatus } from './entities/event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FloorPlanService } from '../floor-plan/floor-plan.service';
import { PocService } from 'src/poc/poc.service';
import { S3Service } from '../common/services/s3.service';
import { EventConstraintsDto } from './dto/event-constraints';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
    private readonly floorPlanService: FloorPlanService,
    @Inject(forwardRef(() => PocService))
    private readonly pocService: PocService,
    private readonly s3Service: S3Service,
  ) {}

  private readonly logger = new Logger('EventService');

  async validateEventCode(eventCode: string): Promise<boolean> {
    const event = await this.eventRepository.findOne({
      where: { eventCode },
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

      const events = await this.eventRepository.find({
        where: whereConditions,
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

  async createEvent(
    user: JwtPayload,
    newEventData: CreateEventDto,
  ): Promise<Event> {
    try {
      // check if event code is already in use
      const event = await this.eventRepository.findOne({
        where: { eventCode: newEventData.eventCode },
      });
      if (event) {
        throw new BadRequestException('Event code already in use');
      }

      // get tenant code from user
      const tenant = await this.accountTenantRepository.findOne({
        where: { userId: user.userId },
      });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const newEvent = this.eventRepository.create({
        ...newEventData,
        tenantCode: tenant.tenantCode,
        eventStatus: EventStatus.PUBLISHED,
      });
      return this.eventRepository.save(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getAllManagedEvents(user: JwtPayload): Promise<Event[]> {
    try {
      // get tenant code from user
      const tenant = await this.accountTenantRepository.findOne({
        where: { userId: user.userId },
      });
      if (!tenant) {
        throw new NotFoundException('Tenant not found');
      }

      const events = await this.eventRepository.find({
        where: { tenantCode: tenant.tenantCode },
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
        where: { eventCode },
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
      const event = await this.getEventByCode(eventCode);
      if (!event) {
        throw new NotFoundException(
          `Event with event code ${eventCode} not found`,
        );
      }

      Object.assign(event, updateEventDto);
      return this.eventRepository.save(event);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async removeEvent(eventCode: string): Promise<void> {
    try {
      const event = await this.getEventByCode(eventCode);
      if (!event) {
        throw new NotFoundException(
          `Event with event code ${eventCode} not found`,
        );
      }
      await this.floorPlanService.removeFloorPlan(eventCode); // hard delete
      await this.pocService.removeAllPocs(eventCode); // hard delete
      await this.deleteEventImages(event.eventCode); // Delete image files
      await this.eventRepository.delete(event.eventCode);
    } catch (error) {
      console.error('Error removing event:', error);
      throw error;
    }
  }

  async getEventStatus(eventCode: string): Promise<EventStatus> {
    try {
      const event = await this.getEventByCode(eventCode);
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
      const events = await this.eventRepository.find({
        where: { eventStatus: EventStatus.ACTIVE && EventStatus.PUBLISHED },
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
      }

      await this.eventRepository.save(events);
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
      const event = await this.getEventByCode(eventCode);
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
      await this.eventRepository.save(event);

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
      const event = await this.getEventByCode(eventCode);
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
      const event = await this.getEventByCode(eventCode);
      if (!event) {
        throw new NotFoundException(`Event with code ${eventCode} not found`);
      }

      for (const imageKey of event.images) {
        await this.s3Service.deleteFile(imageKey);
      }

      event.images = [];
      await this.eventRepository.save(event);
    } catch (error) {
      console.error('Error deleting event images:', error);
      throw error;
    }
  }
}
