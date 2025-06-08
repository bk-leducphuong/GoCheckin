import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Event } from '../event/entities/event.entity';

@Injectable()
export class EventRepository {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async findOne(where: FindOptionsWhere<Event>): Promise<Event | null> {
    try {
      return await this.eventRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(where: FindOptionsWhere<Event>): Promise<Event[]> {
    try {
      return await this.eventRepository.find({
        where,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(data: Partial<Event>): Promise<Event> {
    try {
      const event: Event = this.eventRepository.create(data);
      return await this.eventRepository.save(event);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(eventCode: string, data: Partial<Event>): Promise<Event> {
    try {
      const updateEvent = await this.eventRepository.update(
        { eventCode },
        data,
      );
      if (updateEvent.affected === 0) {
        throw new NotFoundException('Event not found');
      }
      return (await this.findOne({ eventCode })) as Event;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
