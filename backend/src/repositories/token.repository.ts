import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Token } from '../auth/entities';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async findOne(where: FindOptionsWhere<Token>): Promise<Token | null> {
    try {
      return await this.tokenRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll(where: FindOptionsWhere<Token>): Promise<Token[]> {
    try {
      return await this.tokenRepository.find({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  create(data: Partial<Token>): Token {
    try {
      return this.tokenRepository.create(data);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async save(token: Token): Promise<Token> {
    try {
      return await this.tokenRepository.save(token);
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

  async delete(where: FindOptionsWhere<Token>): Promise<void> {
    try {
      await this.tokenRepository.delete(where);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
