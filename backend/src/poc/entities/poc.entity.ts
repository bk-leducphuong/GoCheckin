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
import { PocInvite } from './poc-invite';
import { GuestCheckin } from 'src/guest/entities/guest-checkin.entity';

export enum PointStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('points_of_checkin')
export class PointOfCheckin {
  @PrimaryGeneratedColumn('uuid', { name: 'poc_id' })
  pocId: string;

  @Column({ name: 'point_code', type: 'varchar' })
  pointCode: string;

  @Column({ name: 'point_name', type: 'varchar' })
  pointName: string;

  @Column({ name: 'point_note', type: 'text', nullable: true })
  pointNote: string;

  @Column({ type: 'integer', nullable: true })
  capacity: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PointStatus,
    default: PointStatus.ACTIVE,
  })
  status: PointStatus;

  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

  @Column({ name: 'user_id', type: 'varchar' })
  userId: string;

  // Relations
  @ManyToOne(() => Event, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_code', referencedColumnName: 'eventCode' })
  event: Event;

  @ManyToOne(() => Account, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  account: Account;

  @OneToMany(
    () => PointCheckinAnalytics,
    (pointCheckinAnalytics) => pointCheckinAnalytics.point,
    {
      cascade: true,
    },
  )
  pointCheckinAnalytics: PointCheckinAnalytics[];

  @OneToOne(() => PocLocation, (floorPlan) => floorPlan.poc, {
    cascade: true,
  })
  location: PocLocation;

  @OneToMany(() => PocInvite, (pocInvite) => pocInvite.point, {
    cascade: true,
  })
  pocInvites: PocInvite[];

  @OneToMany(() => GuestCheckin, (guestCheckin) => guestCheckin.point, {
    cascade: true,
  })
  guestCheckins: GuestCheckin[];
}
