import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PocInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class PocInvite {
  @PrimaryGeneratedColumn('uuid', { name: 'invite_id' })
  inviteId: string;

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

  @Column({ name: 'point_code', type: 'varchar' })
  pointCode: string;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'status', type: 'enum', enum: PocInviteStatus })
  status: PocInviteStatus;

  @Column({ name: 'invite_code', type: 'varchar', nullable: true })
  inviteCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
