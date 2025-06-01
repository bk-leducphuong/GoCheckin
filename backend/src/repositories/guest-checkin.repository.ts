import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestCheckin } from '../guest/entities/guest-checkin.entity';

@Injectable()
export class GuestCheckinRepository {
  constructor(
    @InjectRepository(GuestCheckin)
    private readonly guestCheckinRepository: Repository<GuestCheckin>,
  ) {}

  async findExistingCheckin(
    guestCode: string,
    pointCode: string,
  ): Promise<GuestCheckin | null> {
    try {
      return await this.guestCheckinRepository.findOne({
        where: {
          guestCode: guestCode,
          pointCode: pointCode,
          active: true,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<GuestCheckin>): GuestCheckin {
    try {
      return this.guestCheckinRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(checkin: GuestCheckin): Promise<GuestCheckin> {
    try {
      return await this.guestCheckinRepository.save(checkin);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByPointAndEvent(
    pointCode: string,
    eventCode: string,
  ): Promise<GuestCheckin[]> {
    try {
      return await this.guestCheckinRepository.find({
        where: { pointCode, eventCode, active: true },
        order: { checkinTime: 'DESC' },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByEvent(eventCode: string): Promise<GuestCheckin[]> {
    try {
      return await this.guestCheckinRepository.find({
        where: { eventCode, active: true },
        order: { checkinTime: 'DESC' },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAllByEvent(eventCode: string): Promise<GuestCheckin[]> {
    try {
      return await this.guestCheckinRepository.find({
        where: { eventCode },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
