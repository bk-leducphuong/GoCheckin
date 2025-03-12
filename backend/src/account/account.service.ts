import {
  Injectable,
  // UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountDto } from './dto/account.dto';
import { CreateAccountDto } from './dto/create-account.dto';
// import { UpdateAccountDto } from './dto/update-account.dto';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const newAccount = this.accountRepository.create(createAccountDto);
    return this.accountRepository.save(newAccount);
  }

  async getAccount(userId: string): Promise<AccountDto> {
    const account = await this.accountRepository.findOne({
      where: { id: userId },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return {
      id: account.id,
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

  // async updateAccount(
  //   userId: string,
  //   updateDto: UpdateAccountDto,
  // ): Promise<AccountDto> {
  //   const account = await this.accountRepository.findOne({
  //     where: { id: userId },
  //   });

  //   if (!account) {
  //     throw new NotFoundException('Account not found');
  //   }

  //   if (updateDto.currentPassword && updateDto.newPassword) {
  //     const isValidPassword = await bcrypt.compare(
  //       updateDto.currentPassword,
  //       account.password,
  //     );

  //     if (!isValidPassword) {
  //       throw new UnauthorizedException('Current password is incorrect');
  //     }

  //     updateDto.newPassword = await bcrypt.hash(updateDto.newPassword, 10);
  //   }

  //   const updateData: Partial<Account> = {};
  //   if (updateDto.username) updateData.username = updateDto.username;
  //   if (updateDto.email) updateData.email = updateDto.email;
  //   if (updateDto.fullName) updateData.fullName = updateDto.fullName;
  //   if (updateDto.phoneNumber) updateData.phoneNumber = updateDto.phoneNumber;
  //   if (updateDto.companyName) updateData.companyName = updateDto.companyName;
  //   if (updateDto.newPassword) updateData.password = updateDto.newPassword;

  //   await this.accountRepository.update(userId, updateData);

  //   const updatedAccount = await this.accountRepository.findOne({
  //     where: { id: userId },
  //   });

  //   return {
  //     id: updatedAccount.id,
  //     username: updatedAccount.username,
  //     email: updatedAccount.email,
  //     fullName: updatedAccount.fullName,
  //     phoneNumber: updatedAccount.phoneNumber,
  //     active: updatedAccount.active,
  //     role: updatedAccount.role,
  //     companyName: updatedAccount.companyName,
  //     lastLogin: updatedAccount.lastLogin,
  //     enabled: updatedAccount.enabled,
  //     createdAt: updatedAccount.createdAt,
  //     updatedAt: updatedAccount.updatedAt,
  //   };
  // }
}
