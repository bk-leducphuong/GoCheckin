import {
  Entity,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../account/entities/account.entity';

@Entity('refresh_tokens')
export class Token {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'refresh_token' })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @ManyToOne(() => Account, (account) => account.refreshTokens)
  user: Account;
}
