import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';

@Entity('otp')
export class Otp {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'hashed_otp' })
  hashedOtp: string;

  @Column({ name: 'exprised_at' })
  expriedAt: Date;

  @Column({ name: 'attempts' })
  attempts: number;

  @ManyToOne(() => Account, (account) => account.otp)
  account: Account;
}
