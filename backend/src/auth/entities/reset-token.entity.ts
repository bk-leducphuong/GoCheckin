import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';
import { Account } from 'src/account/entities/account.entity';

@Entity('reset_tokens')
export class ResetToken {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'hashed_reset_token' })
  hashedResetToken: string;

  @Column({ name: 'exprised_at' })
  expriedAt: Date;

  @ManyToOne(() => Account, (account) => account.resetTokens)
  account: Account;
}
