import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from 'src/account/entities/account.entity';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'hashed_otp' })
  hashedOtp: string;

  @Column({ name: 'exprised_at' })
  expriedAt: Date;

  @Column({ name: 'attempts' })
  attempts: number;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  // Relations
  @ManyToOne(() => Account, (account) => account.otp, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  account: Account;
}
