import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AccountTenant } from '../account/entities/account-tenant.entity';

@Injectable()
export class AccountTenantRepository {
  constructor(
    @InjectRepository(AccountTenant)
    private readonly accountTenantRepository: Repository<AccountTenant>,
  ) {}

  async findOne(
    where: FindOptionsWhere<AccountTenant>,
  ): Promise<AccountTenant | null> {
    try {
      return await this.accountTenantRepository.findOne({ where });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async create(userId: string, tenantId: string): Promise<AccountTenant> {
    try {
      const newAccountTenant = this.accountTenantRepository.create({
        userId: userId,
        tenantId: tenantId,
      });
      return await this.accountTenantRepository.save(newAccountTenant);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
