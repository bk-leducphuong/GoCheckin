import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';

@Entity('tenants')
export class Tenant {
  @PrimaryGeneratedColumn('uuid', { name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'tenant_code', type: 'varchar', length: 50, unique: true })
  tenantCode: string;

  @Column({ name: 'tenant_name', type: 'varchar', length: 255 })
  tenantName: string;

  @Column({ name: 'tenant_address', type: 'text' })
  tenantAddress: string;

  @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({
    name: 'contact_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contactName: string;

  @Column({
    name: 'contact_phone',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  contactPhone: string;

  @Column({
    name: 'contact_email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  contactEmail: string;

  @CreateDateColumn({ name: 'registration_date', type: 'timestamp' })
  registrationDate: Date;

  @Column({ name: 'expiration_date', type: 'timestamp', nullable: true })
  expirationDate: Date;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled: boolean;

  @OneToMany(() => Event, (event) => event.tenant)
  events: Event[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
