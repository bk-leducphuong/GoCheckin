import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from 'src/event/entities/event.entity';
import { PointOfCheckin } from './poc.entity';

export enum PocInviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

@Entity()
export class PocInvite {
  @PrimaryGeneratedColumn('uuid', { name: 'invite_id' })
  inviteId: string;

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

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

  @Column({ name: 'point_code', type: 'varchar' })
  pointCode: string;

  // Relations
  @ManyToOne(() => Event, (event) => event.pocInvites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_code', referencedColumnName: 'eventCode' })
  event: Event;

  @ManyToOne(() => PointOfCheckin, (point) => point.pocInvites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'point_code', referencedColumnName: 'pointCode' })
  point: PointOfCheckin;
}
