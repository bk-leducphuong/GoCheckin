import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { Account } from './entities/account.entity';
import { AccountTenant } from './entities/account-tenant.entity';
import { AccountTenantService } from './account-tenant.service';
import { AccountRepository } from '../repositories/account.repository';
import { AccountTenantRepository } from '../repositories/account-tenant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountTenant])],
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountTenantService,
    AccountRepository,
    AccountTenantRepository,
  ],
  exports: [AccountService, AccountTenantService],
})
export class AccountModule {}
