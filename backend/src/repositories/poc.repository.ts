import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PointOfCheckin } from '../poc/entities/poc.entity';

@Injectable()
export class PocRepository {
  constructor(
    @InjectRepository(PointOfCheckin)
    private readonly pocRepository: Repository<PointOfCheckin>,
  ) {}

  async findOne(
    where: FindOptionsWhere<PointOfCheckin>,
  ): Promise<PointOfCheckin | null> {
    try {
      return await this.pocRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(
    where: FindOptionsWhere<PointOfCheckin>,
  ): Promise<PointOfCheckin[]> {
    try {
      return await this.pocRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<PointOfCheckin>): PointOfCheckin {
    try {
      return this.pocRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(poc: PointOfCheckin): Promise<PointOfCheckin> {
    try {
      return await this.pocRepository.save(poc);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    conditions: Partial<PointOfCheckin>,
    data: Partial<PointOfCheckin>,
  ): Promise<void> {
    try {
      await this.pocRepository.update(conditions, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(where: FindOptionsWhere<PointOfCheckin>): Promise<void> {
    try {
      await this.pocRepository.delete(where);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
