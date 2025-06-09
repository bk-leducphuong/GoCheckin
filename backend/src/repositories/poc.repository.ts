import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Poc } from '../poc/entities';

@Injectable()
export class PocRepository {
  constructor(
    @InjectRepository(Poc)
    private readonly pocRepository: Repository<Poc>,
  ) {}

  async findOne(where: FindOptionsWhere<Poc>): Promise<Poc | null> {
    try {
      return await this.pocRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(where: FindOptionsWhere<Poc>): Promise<Poc[]> {
    try {
      return await this.pocRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<Poc>): Poc {
    try {
      return this.pocRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(poc: Poc): Promise<Poc> {
    try {
      return await this.pocRepository.save(poc);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(conditions: Partial<Poc>, data: Partial<Poc>): Promise<void> {
    try {
      await this.pocRepository.update(conditions, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(where: FindOptionsWhere<Poc>): Promise<void> {
    try {
      await this.pocRepository.delete(where);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
