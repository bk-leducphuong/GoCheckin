import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Account } from '../../account/entities/account.entity';
import { PointCheckinAnalytics } from '../../analysis/entities/point-checkin-analytics.entity';
import { PocLocation } from '../entities/poc-location.entity';
import { PocInvite } from './poc-invite.entity';
import { GuestCheckin } from 'src/guest/entities/guest-checkin.entity';

export enum PocStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity()
export class Poc {
  @PrimaryGeneratedColumn('uuid', { name: 'poc_id' })
  pocId: string;

  @Column({ name: 'poc_code', type: 'varchar' })
  pocCode: string;

  @Column({ name: 'poc_name', type: 'varchar' })
  pointName: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer', nullable: true })
  capacity: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PocStatus,
    default: PocStatus.ACTIVE,
  })
  status: PocStatus;

  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'event_id', type: 'varchar' })
  eventId: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  // Relations
  @ManyToOne(() => Event, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'eventId' })
  event: Event;

  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  account: Account;

  @OneToMany(
    () => PointCheckinAnalytics,
    (pointCheckinAnalytics) => pointCheckinAnalytics.poc,
    {
      cascade: true,
    },
  )
  pointCheckinAnalytics: PointCheckinAnalytics[];

  @OneToOne(() => PocLocation, (floorPlan) => floorPlan.poc, {
    cascade: true,
  })
  location: PocLocation;

  @OneToMany(() => PocInvite, (pocInvite) => pocInvite.poc, {
    cascade: true,
  })
  pocInvites: PocInvite[];

  @OneToMany(() => GuestCheckin, (guestCheckin) => guestCheckin.poc, {
    cascade: true,
  })
  guestCheckins: GuestCheckin[];
}
