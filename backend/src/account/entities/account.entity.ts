import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Token } from '../../auth/entities/token.entity';
import { Otp } from '../../auth/entities/otp.entity';
import { ResetToken } from '../../auth/entities/reset-token.entity';

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  POC = 'poc',
}

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ name: 'full_name', length: 255, nullable: true })
  fullName: string;

  @Column({ name: 'phone_number', length: 50, nullable: true, unique: true })
  phoneNumber: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToMany(() => Token, (token) => token.user)
  refreshTokens: Token[];

  @OneToMany(() => Token, (token) => token.user)
  otp: Otp[];

  @OneToMany(() => ResetToken, (resetToken) => resetToken.account)
  resetTokens: ResetToken[];
}
