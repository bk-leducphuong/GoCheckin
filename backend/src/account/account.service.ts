import { Injectable, NotFoundException } from '@nestjs/common';
import { Account } from './entities/account.entity';
import { AccountDto, CreateAccountDto, UpdateAccountDto } from './dto';
import {
  AccountTenantRepository,
  PocRepository,
  PocInviteRepository,
  PocLocationRepository,
  TokenRepository,
  OtpRepository,
  ResetTokenRepository,
  EventRepository,
  PointCheckinAnalysisRepository,
  EventCheckinAnalysisRepository,
  GuestCheckinRepository,
  AccountRepository,
} from 'src/repositories';
import { DataSource } from 'typeorm';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly dataSource: DataSource,
    private readonly accountTenantRepository: AccountTenantRepository,
    private readonly pocRepository: PocRepository,
    private readonly pocInviteRepository: PocInviteRepository,
    private readonly pocLocationRepository: PocLocationRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly otpRepository: OtpRepository,
    private readonly resetTokenRepository: ResetTokenRepository,
    private readonly eventRepository: EventRepository,
    private readonly pointCheckinAnalysisRepository: PointCheckinAnalysisRepository,
    private readonly eventCheckinAnalysisRepository: EventCheckinAnalysisRepository,
    private readonly guestCheckinRepository: GuestCheckinRepository,
  ) {}

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

  async deletePocAccount(userId: string): Promise<void> {
    await this.accountRepository.delete({ userId: userId });
  }

  async deleteAdminAccount(userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if account exists
      const account = await this.accountRepository.findOne({ userId });
      if (!account) {
        throw new NotFoundException('Account not found');
      }

      // Get all POCs created by this user
      const userPocs = await this.pocRepository.findAll({ userId });
      const pocIds = userPocs.map((poc) => poc.pocId);
      // Delete in the correct order to avoid foreign key constraint violations

      // 1. Delete guest check-ins for user's POCs
      if (pocIds.length > 0) {
        await queryRunner.manager.delete('GuestCheckin', {
          pocId: { $in: pocIds },
        });
      }

      // 2. Delete POC analytics for user's POCs
      if (pocIds.length > 0) {
        await queryRunner.manager.delete('PointCheckinAnalytics', {
          pocId: { $in: pocIds },
        });
      }

      // 3. Delete POC invites for user's POCs
      if (pocIds.length > 0) {
        await queryRunner.manager.delete('PocInvite', {
          pocId: { $in: pocIds },
        });
      }

      // 4. Delete POC locations for user's POCs
      if (pocIds.length > 0) {
        await queryRunner.manager.delete('PocLocation', {
          pocId: { $in: pocIds },
        });
      }

      // 5. Delete user's POCs
      if (pocIds.length > 0) {
        await queryRunner.manager.delete('Poc', { userId });
      }

      // 6. Delete events and their analytics if user has tenant access
      const userEvents = await this.eventRepository.findAll({
        userId,
      });
      const eventIds = userEvents.map((event) => event.eventId);

      if (eventIds.length > 0) {
        // Delete event analytics
        await queryRunner.manager.delete('EventCheckinAnalytics', {
          eventId: { $in: eventIds },
        });

        // Delete events
        await queryRunner.manager.delete('Event', {
          userId: userId,
        });
      }

      // 7. Delete account-tenant relationships
      await queryRunner.manager.delete('AccountTenant', { userId });

      // 8. Delete auth-related tokens
      await queryRunner.manager.delete('Token', { userId });
      await queryRunner.manager.delete('Otp', { userId });
      await queryRunner.manager.delete('ResetToken', { userId });

      // 9. Finally, delete the account
      await queryRunner.manager.delete('Account', { userId });

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
