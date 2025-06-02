import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { GuestCheckin } from '../guest/entities/guest-checkin.entity';

@Injectable()
export class GuestCheckinRepository {
  constructor(
    @InjectRepository(GuestCheckin)
    private readonly guestCheckinRepository: Repository<GuestCheckin>,
  ) {}

  async findOne(
    where: FindOptionsWhere<GuestCheckin>,
  ): Promise<GuestCheckin | null> {
    try {
      return await this.guestCheckinRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(
    where: FindOptionsWhere<GuestCheckin>,
  ): Promise<GuestCheckin[]> {
    try {
      return await this.guestCheckinRepository.find({ where });
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
}
