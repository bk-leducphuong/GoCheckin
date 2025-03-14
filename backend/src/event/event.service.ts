import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  async findAll(status?: string, tenantCode?: string): Promise<Event[]> {
    const query = this.eventRepository.createQueryBuilder('event');

    if (status) {
      query.andWhere('event.eventStatus = :status', {
        status: status.toUpperCase(),
      });
    }

    if (tenantCode) {
      query.andWhere('event.tenantCode = :tenantCode', { tenantCode });
    }

    query.orderBy('event.createdAt', 'DESC');

    return query.getMany();
  }

  async findOne(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { eventId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    return event;
  }

  async update(
    eventId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    const event = await this.findOne(eventId);

    // Update the event
    Object.assign(event, updateEventDto);

    return this.eventRepository.save(event);
  }

  async remove(eventId: string): Promise<void> {
    const event = await this.findOne(eventId);
    await this.eventRepository.remove(event);
  }
}
