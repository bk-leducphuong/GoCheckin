import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountTenant } from './entities/account-tenant.entity';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const newAccount = this.accountRepository.create(createAccountDto);
    return this.accountRepository.save(newAccount);
  }

  async getAccount(userId: string): Promise<AccountDto> {
    const account = await this.accountRepository.findOne({
      where: { userId: userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return {
      userId: account.userId,
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      phoneNumber: account.phoneNumber,
      active: account.active,
      role: account.role,
      companyName: account.companyName,
      lastLogin: account.lastLogin,
      enabled: account.enabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async findByEmail(email: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { email },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async findById(userId: string): Promise<Account> {
    const account = await this.accountRepository.findOne({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return account;
  }

  async updateAccount(
    userId: string,
    updateDto: UpdateAccountDto,
  ): Promise<AccountDto> {
    const account = await this.accountRepository.findOne({
      where: { userId: userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const updateData: Partial<Account> = {};
    if (updateDto.username) updateData.username = updateDto.username;
    if (updateDto.email) updateData.email = updateDto.email;
    if (updateDto.fullName) updateData.fullName = updateDto.fullName;
    if (updateDto.phoneNumber) updateData.phoneNumber = updateDto.phoneNumber;
    if (updateDto.companyName) updateData.companyName = updateDto.companyName;
    if (updateDto.password) updateData.password = updateDto.password;

    await this.accountRepository.update(userId, updateData);

    return {
      userId: account.userId,
      username: account.username,
      email: account.email,
      fullName: account.fullName,
      phoneNumber: account.phoneNumber,
      active: account.active,
      role: account.role,
      companyName: account.companyName,
      lastLogin: account.lastLogin,
      enabled: account.enabled,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    const account = await this.accountRepository.findOne({
      where: { userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    // Soft delete by disabling the account
    await this.accountRepository.update(userId, {
      active: false,
      enabled: false,
    });

    // If you want to completely remove the account, use this instead:
    // await this.accountRepository.remove(account);
  }

  async createAccountTenant(userId: string, tenantCode: string) {
    try {
      const accountTenant = await this.accountTenantRepository.findOne({
        where: { userId: userId, tenantCode: tenantCode },
      });
      if (accountTenant) {
        throw new UnauthorizedException('Account already exists in tenant');
      }
      const newAccountTenant = this.accountTenantRepository.create({
        userId: userId,
        tenantCode: tenantCode,
      });
      await this.accountTenantRepository.save(newAccountTenant);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
