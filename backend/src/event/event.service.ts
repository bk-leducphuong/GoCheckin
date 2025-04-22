import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { AccountTenant } from 'src/account/entities/account-tenant.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { EventStatus } from './entities/event.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FloorPlanService } from '../floor-plan/floor-plan.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
    private readonly floorPlanService: FloorPlanService,
  ) {}

  private readonly logger = new Logger('EventService');

  async validateEventCode(eventCode: string): Promise<boolean> {
    const event = await this.eventRepository.findOne({
      where: { eventCode },
    });

    return !!event;
  }

  async create(user: JwtPayload, newEventData: CreateEventDto): Promise<Event> {
    try {
      const { floorPlanImg, ...eventData } = newEventData;
      // check if event code is already in use
      const event = await this.eventRepository.findOne({
        where: { eventCode: eventData.eventCode },
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

      // Save floor plan image
      if (floorPlanImg) {
        await this.floorPlanService.saveFloorPlan(
          eventData.eventCode,
          floorPlanImg,
        );
      }

      const newEvent = this.eventRepository.create({
        ...eventData,
        tenantCode: tenant.tenantCode,
        eventStatus: EventStatus.PUBLISHED,
      });
      return this.eventRepository.save(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      // Handle any errors that occur during the creation process
      throw new BadRequestException('Failed to create event');
    }
  }

  async findAll(user: JwtPayload): Promise<Event[]> {
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
    return events;
  }

  async findOne(eventCode: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { eventCode },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventCode} not found`);
    }

    return event;
  }

  async update(
    eventCode: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findOne(eventCode);
    // Update the event
    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async remove(eventId: string): Promise<void> {
    const event = await this.findOne(eventId);
    await this.eventRepository.remove(event);
  }

  async getEventStatus(eventCode: string): Promise<EventStatus> {
    const event = await this.findOne(eventCode);
    if (!event) {
      throw new NotFoundException(`Event with code ${eventCode} not found`);
    }
    return event.eventStatus;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updateEventStatus() {
    this.logger.log('Updating event status...');
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
  }
}
