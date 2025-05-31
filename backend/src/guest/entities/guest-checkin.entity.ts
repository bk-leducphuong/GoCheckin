import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';
import { PointOfCheckin } from 'src/poc/entities/poc.entity';
import { Event } from 'src/event/entities/event.entity';

@Entity('guest_checkins')
export class GuestCheckin {
  @PrimaryGeneratedColumn('uuid', { name: 'checkin_id' })
  checkinId: string;

  @Column({ name: 'guest_id', type: 'uuid' })
  guestId: string;

  @Column({ name: 'guest_code', type: 'varchar' })
  guestCode: string;

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

  @Column({ name: 'point_code', type: 'varchar' })
  pointCode: string;

  @CreateDateColumn({
    name: 'checkin_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkinTime: Date;

  // Relations
  @ManyToOne(() => Guest, (guest) => guest.checkins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @ManyToOne(() => PointOfCheckin, (point) => point.guestCheckins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'point_code' })
  point: PointOfCheckin;

  @ManyToOne(() => Event, (event) => event.guestCheckins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_code' })
  event: Event;
}
