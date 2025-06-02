import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AccountTenantService } from './account-tenant.service';
import { RepositoryModule } from '../repositories/repository.module';

@Module({
  imports: [RepositoryModule],
  controllers: [AccountController],
  providers: [AccountService, AccountTenantService],
  exports: [AccountService, AccountTenantService],
})
export class AccountModule {}
