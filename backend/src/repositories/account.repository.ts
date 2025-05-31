import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { AccountTenant } from '../account/entities/account-tenant.entity';
import { CreateAccountDto } from '../account/dto/create-account.dto';

@Injectable()
export class AccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
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

  async findByUserId(userId: string): Promise<Account | null> {
    try {
      const account = await this.accountRepository.findOne({
        where: { userId: userId },
      });
      return account;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<Account | null> {
    try {
      const account = await this.accountRepository.findOne({
        where: { email },
      });
      return account;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findById(userId: string): Promise<Account | null> {
    try {
      const account = await this.accountRepository.findOne({
        where: { userId },
      });
      return account;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(userId: string, updateData: Partial<Account>): Promise<void> {
    try {
      await this.accountRepository.update(userId, updateData);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async softDelete(userId: string): Promise<void> {
    try {
      await this.accountRepository.update(userId, {
        active: false,
        enabled: false,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async remove(account: Account): Promise<void> {
    try {
      await this.accountRepository.remove(account);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
