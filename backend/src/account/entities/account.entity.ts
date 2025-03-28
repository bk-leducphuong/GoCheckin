import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { RefreshToken } from '../../auth/entities/token.entity';

export enum UserRole {
  ADMIN = 'admin',
  TENANT = 'tenant',
  POC = 'poc',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'full_name', length: 255, nullable: true })
  fullName: string;

  @Column({ name: 'phone_number', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ length: 255 })
  email: string;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'company_name', length: 255, nullable: true })
  companyName: string;

  @Column({ name: 'last_login', type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: RefreshToken[];
}
