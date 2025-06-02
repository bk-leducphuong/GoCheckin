import { Injectable } from '@nestjs/common';
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

  create(data: Partial<Event>): Event {
    try {
      return this.eventRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(event: Event): Promise<Event> {
    try {
      return await this.eventRepository.save(event);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async saveMultiple(events: Event[]): Promise<Event[]> {
    try {
      return await this.eventRepository.save(events);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(eventCode: string): Promise<void> {
    try {
      await this.eventRepository.delete(eventCode);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
