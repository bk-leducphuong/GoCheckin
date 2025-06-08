import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Token } from '../../auth/entities/token.entity';
import { Otp } from '../../auth/entities/otp.entity';
import { ResetToken } from '../../auth/entities/reset-token.entity';
import { Event } from 'src/event/entities/event.entity';

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

  // Relations
  @OneToMany(() => Token, (token) => token.user, {
    cascade: true,
  })
  refreshTokens: Token[];

  @OneToMany(() => Token, (token) => token.user, {
    cascade: true,
  })
  otp: Otp[];

  @OneToMany(() => ResetToken, (resetToken) => resetToken.account, {
    cascade: true,
  })
  resetTokens: ResetToken[];

  @OneToMany(() => Event, (event) => event.account, {
    cascade: true,
  })
  events: Event[];
}
