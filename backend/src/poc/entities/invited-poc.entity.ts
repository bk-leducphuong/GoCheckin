import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InvitedPocStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class InvitedPoc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_code', type: 'varchar', length: 50 })
  eventCode: string;

  @Column({ name: 'point_code', type: 'varchar', length: 50 })
  pointCode: string;

  @Column({ name: 'email', type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'status', type: 'enum', enum: InvitedPocStatus })
  status: InvitedPocStatus;

  @Column({ name: 'invite_code', type: 'varchar', length: 50, nullable: true })
  inviteCode: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
