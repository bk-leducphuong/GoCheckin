import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { Account } from '../../account/entities/account.entity';
import { GuestCheckin } from '../../guest/entities/guest-checkin.entity';

export enum PointStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
}

@Entity('points_of_checkin')
export class PointOfCheckin {
  @PrimaryGeneratedColumn('uuid', { name: 'poc_id' })
  pocId: string;

  @Column({ name: 'point_code', type: 'varchar', length: 50, unique: true })
  pointCode: string;

  @Column({ name: 'point_name', type: 'varchar', length: 255 })
  pointName: string;

  @Column({ name: 'point_note', type: 'text', nullable: true })
  pointNote: string;

  @Column({ name: 'event_code', type: 'varchar', length: 50 })
  eventCode: string;

  @Column({ name: 'user_id', type: 'varchar', nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'integer', nullable: true })
  capacity: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PointStatus,
    default: PointStatus.ACTIVE,
  })
  status: PointStatus;

  @Column({ name: 'open_time', type: 'time', nullable: true })
  openTime: Date;

  @Column({ name: 'close_time', type: 'time', nullable: true })
  closeTime: Date;

  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string;

  @Column({ name: 'floor_level', type: 'varchar', length: 10, nullable: true })
  floorLevel: string;

  @Column({ name: 'enabled', type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'event_code', referencedColumnName: 'eventCode' })
  event: Event;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  account: Account;

  @OneToMany(() => GuestCheckin, (checkin) => checkin.pointOfCheckin)
  checkins: GuestCheckin[];
}
