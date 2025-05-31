import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PocInvite, PocInviteStatus } from '../poc/entities/poc-invite';

@Injectable()
export class PocInviteRepository {
  constructor(
    @InjectRepository(PocInvite)
    private readonly pocInviteRepository: Repository<PocInvite>,
  ) {}

  async findByEventPointAndEmail(
    eventCode: string,
    pointCode: string,
    email: string,
  ): Promise<PocInvite | null> {
    try {
      return await this.pocInviteRepository.findOne({
        where: { eventCode, pointCode, email },
      });
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

  async findByInviteCodeAndStatus(
    inviteCode: string,
    status: PocInviteStatus,
  ): Promise<PocInvite | null> {
    try {
      return await this.pocInviteRepository.findOne({
        where: { inviteCode, status },
      });
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

  async findByEventAndPoint(
    eventCode: string,
    pointCode: string,
  ): Promise<PocInvite | null> {
    try {
      return await this.pocInviteRepository.findOne({
        where: { eventCode, pointCode },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
