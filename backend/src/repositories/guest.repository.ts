import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from '../guest/entities/guest.entity';

@Injectable()
export class GuestRepository {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
  ) {}

  async findByGuestCodeAndEventCode(
    guestCode: string,
    eventCode: string,
  ): Promise<Guest | null> {
    try {
      return await this.guestRepository.findOne({
        where: {
          guestCode: guestCode,
          eventCode: eventCode,
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<Guest>): Guest {
    try {
      return this.guestRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(guest: Guest): Promise<Guest> {
    try {
      return await this.guestRepository.save(guest);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByIdEnabled(guestId: string): Promise<Guest | null> {
    try {
      return await this.guestRepository.findOne({
        where: { guestId: guestId, enabled: true },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByIdWithRelations(id: string): Promise<Guest | null> {
    try {
      return await this.guestRepository.findOne({
        where: { guestId: id, enabled: true },
        relations: ['checkins', 'checkins.pointOfCheckin'],
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
