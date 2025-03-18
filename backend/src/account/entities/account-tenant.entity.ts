import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from './account.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';

@Entity('account_tenants')
export class AccountTenant {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'tenant_code' })
  tenantCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  account: Account;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenant_code', referencedColumnName: 'tenantCode' })
  tenant: Tenant;
}
