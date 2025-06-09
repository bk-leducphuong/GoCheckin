import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ResetToken } from '../auth/entities';

@Injectable()
export class ResetTokenRepository {
  constructor(
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
  ) {}

  async findOne(
    where: FindOptionsWhere<ResetToken>,
  ): Promise<ResetToken | null> {
    try {
      return await this.resetTokenRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(where: FindOptionsWhere<ResetToken>): Promise<ResetToken[]> {
    try {
      return await this.resetTokenRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<ResetToken>): ResetToken {
    try {
      return this.resetTokenRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(resetToken: ResetToken): Promise<ResetToken> {
    try {
      return await this.resetTokenRepository.save(resetToken);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(resetToken: ResetToken): Promise<void> {
    try {
      await this.resetTokenRepository.remove(resetToken);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
