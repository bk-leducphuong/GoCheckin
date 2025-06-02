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

  @Column({ name: 'event_id', type: 'varchar' })
  eventId: string;

  @Column({ name: 'poc_id', type: 'varchar' })
  pocId: string;

  // Relations
  @ManyToOne(() => Event, (event) => event.pocInvites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'eventId' })
  event: Event;

  @ManyToOne(() => PointOfCheckin, (poc) => poc.pocInvites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poc_id', referencedColumnName: 'pocId' })
  point: PointOfCheckin;
}
