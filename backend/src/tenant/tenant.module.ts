import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant]), AccountModule],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
