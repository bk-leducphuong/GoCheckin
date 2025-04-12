import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { AccountTenant } from 'src/account/entities/account-tenant.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { EventStatus } from './entities/event.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
  ) {}

  async validateEventCode(eventCode: string): Promise<boolean> {
    const event = await this.eventRepository.findOne({
      where: { eventCode },
    });

    return !!event;
  }

  async create(user: JwtPayload, newEventData: CreateEventDto): Promise<Event> {
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

  async getEventStatus(eventCode: string): Promise<boolean> {
    const event = await this.findOne(eventCode);
    if (!event) {
      throw new NotFoundException(`Event with code ${eventCode} not found`);
    }
    return event.eventStatus === EventStatus.ACTIVE;
  }
}
