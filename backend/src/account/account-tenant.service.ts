import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AccountTenantRepository } from '../repositories/account-tenant.repository';
import { AccountTenant } from './entities/account-tenant.entity';

@Injectable()
export class AccountTenantService {
  constructor(
    private readonly accountTenantRepository: AccountTenantRepository,
  ) {}

  async createAccountTenantRelation(
    userId: string,
    tenantCode: string,
  ): Promise<void> {
    const existingAccountTenant =
      await this.accountTenantRepository.findByUserIdAndTenantCode(
        userId,
        tenantCode,
      );

    if (existingAccountTenant) {
      throw new UnauthorizedException('Account already exists in tenant');
    }

    await this.accountTenantRepository.create(userId, tenantCode);
  }

  async findTenantsByUserId(userId: string): Promise<AccountTenant> {
    const accountTenant =
      await this.accountTenantRepository.findTenantsByUserId(userId);

    if (!accountTenant) {
      throw new NotFoundException('No tenant found for user');
    }

    return accountTenant;
  }
}
