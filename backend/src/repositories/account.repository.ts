import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Account } from '../account/entities';
import { CreateAccountDto } from '../account/dto';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    try {
      const newAccount = this.accountRepository.create(createAccountDto);
      return this.accountRepository.save(newAccount);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(where: FindOptionsWhere<Account>): Promise<Account | null> {
    try {
      return await this.accountRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(
    where: FindOptionsWhere<Account>,
    updateData: Partial<Account>,
  ): Promise<void> {
    try {
      await this.accountRepository.update(where, updateData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delete(where: FindOptionsWhere<Account>): Promise<void> {
    try {
      await this.accountRepository.delete(where);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
