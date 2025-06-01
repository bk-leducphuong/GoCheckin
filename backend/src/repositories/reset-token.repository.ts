import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ResetToken } from '../auth/entities/reset-token.entity';

@Injectable()
export class ResetTokenRepository {
  constructor(
    @InjectRepository(ResetToken)
    private readonly resetTokenRepository: Repository<ResetToken>,
  ) {}

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

  async findByUserIdNotExpired(userId: string): Promise<ResetToken | null> {
    try {
      return await this.resetTokenRepository.findOne({
        where: { userId: userId, expriedAt: MoreThan(new Date()) },
      });
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
