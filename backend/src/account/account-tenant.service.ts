import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTenant } from './entities/account-tenant.entity';

@Injectable()
export class AccountTenantService {
  constructor(
    @InjectRepository(AccountTenant)
    private accountTenantRepository: Repository<AccountTenant>,
  ) {}

  async createAccountTenantRelation(
    userId: string,
    tenantCode: string,
  ): Promise<void> {
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

  async findTenantsByUserId(userId: string): Promise<AccountTenant> {
    const accountTenant = await this.accountTenantRepository.findOne({
      where: { userId },
      relations: ['tenant'],
    });
    if (!accountTenant) {
      throw new NotFoundException('No tenant found for user');
    }
    return accountTenant;
  }
}
