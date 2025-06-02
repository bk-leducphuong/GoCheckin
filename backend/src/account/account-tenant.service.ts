import { Injectable, NotFoundException } from '@nestjs/common';
import { AccountTenantRepository } from '../repositories/account-tenant.repository';
import { AccountTenant } from './entities/account-tenant.entity';
import { TenantRepository } from 'src/repositories/tenant.repository';

@Injectable()
export class AccountTenantService {
  constructor(
    private readonly accountTenantRepository: AccountTenantRepository,
    private readonly tenantRepository: TenantRepository,
  ) {}

  async createAccountTenantRelation(
    userId: string,
    tenantCode: string,
  ): Promise<void> {
    const tenant = await this.tenantRepository.findOne({
      tenantCode: tenantCode,
    });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    await this.accountTenantRepository.create(userId, tenant.tenantId);
  }

  async findTenantsByUserId(userId: string): Promise<AccountTenant> {
    const accountTenant = await this.accountTenantRepository.findOne({
      userId: userId,
    });

    if (!accountTenant) {
      throw new NotFoundException('No tenant found for user');
    }

    return accountTenant;
  }
}
