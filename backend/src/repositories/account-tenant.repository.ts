import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTenant } from '../account/entities/account-tenant.entity';

@Injectable()
export class AccountTenantRepository {
  constructor(
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
  ) {}

  async findByUserIdAndTenantCode(
    userId: string,
    tenantCode: string,
  ): Promise<AccountTenant | null> {
    try {
      const accountTenant = await this.accountTenantRepository.findOne({
        where: { userId: userId, tenantCode: tenantCode },
      });
      return accountTenant;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(userId: string, tenantCode: string): Promise<AccountTenant> {
    try {
      const newAccountTenant = this.accountTenantRepository.create({
        userId: userId,
        tenantCode: tenantCode,
      });
      return await this.accountTenantRepository.save(newAccountTenant);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findTenantsByUserId(userId: string): Promise<AccountTenant | null> {
    try {
      const accountTenant = await this.accountTenantRepository.findOne({
        where: { userId },
        relations: ['tenant'],
      });
      return accountTenant;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
