import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Token } from '../auth/entities/token.entity';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async saveByUserId(userId: string, data: Partial<Token>): Promise<Token> {
    try {
      return await this.tokenRepository.save({
        ...data,
        user: { userId },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateByUserId(userId: string, data: Partial<Token>): Promise<void> {
    try {
      await this.tokenRepository
        .createQueryBuilder()
        .leftJoin(Account, 'account', 'account.userId = token.userId')
        .where('account.userId = :userId', { userId })
        .update()
        .set(data)
        .execute();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    conditions: Partial<Token>,
    data: Partial<Token>,
  ): Promise<void> {
    try {
      await this.tokenRepository.update(conditions, data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async updateByUserIdAndDeviceInfo(
    userId: string,
    deviceInfo: string,
    data: Partial<Token>,
  ): Promise<void> {
    try {
      await this.tokenRepository
        .createQueryBuilder()
        .leftJoin(Account, 'account', 'account.userId = token.userId')
        .where('account.userId = :userId AND token.deviceInfo = :deviceInfo', {
          userId,
          deviceInfo,
        })
        .update()
        .set(data)
        .execute();
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findActiveToken(refreshToken: string): Promise<Token | null> {
    try {
      return await this.tokenRepository.findOne({
        where: {
          refreshToken,
          isRevoked: false,
          expiresAt: MoreThan(new Date()),
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteExpiredTokens(): Promise<void> {
    try {
      await this.tokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByUserId(userId: string): Promise<Token[]> {
    try {
      const tokens = await this.tokenRepository
        .createQueryBuilder()
        .leftJoin(Account, 'account', 'account.userId = token.userId')
        .where('account.userId = :userId', { userId })
        .getMany();

      return tokens.filter(
        (token) => token.isRevoked === false && token.expiresAt > new Date(),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
