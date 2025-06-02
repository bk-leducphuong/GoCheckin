import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { PocInvite } from '../poc/entities/poc-invite.entity';

@Injectable()
export class PocInviteRepository {
  constructor(
    @InjectRepository(PocInvite)
    private readonly pocInviteRepository: Repository<PocInvite>,
  ) {}

  async findOne(where: FindOptionsWhere<PocInvite>): Promise<PocInvite | null> {
    try {
      return await this.pocInviteRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<PocInvite>): PocInvite {
    try {
      return this.pocInviteRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(pocInvite: PocInvite): Promise<PocInvite> {
    try {
      return await this.pocInviteRepository.save(pocInvite);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    conditions: Partial<PocInvite>,
    data: Partial<PocInvite>,
  ): Promise<void> {
    try {
      await this.pocInviteRepository.update(conditions, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
