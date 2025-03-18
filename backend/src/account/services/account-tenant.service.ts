import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountTenant } from '../entities/account-tenant.entity';

@Injectable()
export class AccountTenantService {
  constructor(
    @InjectRepository(AccountTenant)
    private accountTenantRepository: Repository<AccountTenant>,
  ) {}

  async createAccountTenantRelation(
    userId: string,
    tenantCode: string,
  ): Promise<AccountTenant> {
    const accountTenant = this.accountTenantRepository.create({
      userId,
      tenantCode,
    });
    return this.accountTenantRepository.save(accountTenant);
  }

  async findTenantsByUserId(userId: string): Promise<AccountTenant[]> {
    return this.accountTenantRepository.find({
      where: { userId },
      relations: ['tenant'],
    });
  }

  async findUsersByTenantCode(tenantCode: string): Promise<AccountTenant[]> {
    return this.accountTenantRepository.find({
      where: { tenantCode },
      relations: ['account'],
    });
  }

  async deactivateAccountTenantRelation(
    userId: string,
    tenantCode: string,
  ): Promise<void> {
    const relation = await this.accountTenantRepository.findOne({
      where: { userId, tenantCode },
    });

    if (!relation) {
      throw new NotFoundException(
        `Relation between user ${userId} and tenant ${tenantCode} not found`,
      );
    }

    await this.accountTenantRepository.save(relation);
  }
}
