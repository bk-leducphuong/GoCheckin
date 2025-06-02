import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountRepository } from 'src/repositories';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepository: AccountRepository) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    return this.accountRepository.create(createAccountDto);
  }

  async getAccountInformation(userId: string): Promise<AccountDto> {
    const account = await this.accountRepository.findOne({
      userId: userId,
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
      role: account.role,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  async updateAccount(
    userId: string,
    updateDto: UpdateAccountDto,
  ): Promise<AccountDto> {
    const updateData: Partial<Account> = {};
    if (updateDto.username) updateData.username = updateDto.username;
    if (updateDto.email) updateData.email = updateDto.email;
    if (updateDto.fullName) updateData.fullName = updateDto.fullName;
    if (updateDto.phoneNumber) updateData.phoneNumber = updateDto.phoneNumber;
    if (updateDto.password) updateData.password = updateDto.password;

    await this.accountRepository.update({ userId: userId }, updateData);

    // Fetch updated account
    const updatedAccount = await this.accountRepository.findOne({
      userId: userId,
    });

    if (!updatedAccount) {
      throw new NotFoundException('Account not found after update');
    }

    return {
      userId: updatedAccount.userId,
      username: updatedAccount.username,
      email: updatedAccount.email,
      fullName: updatedAccount.fullName,
      phoneNumber: updatedAccount.phoneNumber,
      role: updatedAccount.role,
      createdAt: updatedAccount.createdAt,
      updatedAt: updatedAccount.updatedAt,
    };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.accountRepository.delete({ userId: userId });
  }
}
