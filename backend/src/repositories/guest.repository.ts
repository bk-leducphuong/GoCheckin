import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Guest } from '../guest/entities';

@Injectable()
export class GuestRepository {
  constructor(
    @InjectRepository(Guest)
    private readonly guestRepository: Repository<Guest>,
  ) {}

  async findOne(where: FindOptionsWhere<Guest>): Promise<Guest | null> {
    try {
      return await this.guestRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(where: FindOptionsWhere<Guest>): Promise<Guest[]> {
    try {
      return await this.guestRepository.find({ where });
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
}
