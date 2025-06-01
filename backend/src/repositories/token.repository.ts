import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Token } from '../auth/entities/token.entity';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async save(data: Partial<Token>): Promise<Token> {
    try {
      return await this.tokenRepository.save(data);
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

  async findUserTokens(userId: string): Promise<Token[]> {
    try {
      return await this.tokenRepository.find({
        where: {
          userId,
          isRevoked: false,
          expiresAt: MoreThan(new Date()),
        },
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
