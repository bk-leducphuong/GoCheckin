import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { AccountModule } from 'src/account/account.module';
import { TenantRepository } from '../repositories/tenant.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), AccountModule],
  controllers: [TenantController],
  providers: [TenantService, TenantRepository],
  exports: [TenantService, TenantRepository],
})
export class TenantModule {}
