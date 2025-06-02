import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PocLocation } from '../poc/entities/poc-location.entity';

@Injectable()
export class PocLocationRepository {
  constructor(
    @InjectRepository(PocLocation)
    private readonly pocLocationRepository: Repository<PocLocation>,
  ) {}

  async findOne(
    where: FindOptionsWhere<PocLocation>,
  ): Promise<PocLocation | null> {
    try {
      return await this.pocLocationRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(where: FindOptionsWhere<PocLocation>): Promise<PocLocation[]> {
    try {
      return await this.pocLocationRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<PocLocation>): PocLocation {
    try {
      return this.pocLocationRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async save(locations: Partial<PocLocation>[]): Promise<PocLocation[]> {
    try {
      return await this.pocLocationRepository.save(locations);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(where: FindOptionsWhere<PocLocation>): Promise<void> {
    try {
      await this.pocLocationRepository.delete(where);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
