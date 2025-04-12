import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';

@Entity('guest_checkins')
export class GuestCheckin {
  @PrimaryGeneratedColumn('uuid', { name: 'checkin_id' })
  checkinId: string;

  @Column({ name: 'guest_id', type: 'uuid' })
  guestId: string;

  @Column({ name: 'guest_code', type: 'varchar', length: 50 })
  guestCode: string;

  @Column({ name: 'event_code', type: 'varchar', length: 50 })
  eventCode: string;

  @Column({ name: 'point_code', type: 'varchar', length: 50 })
  pointCode: string;

  @CreateDateColumn({
    name: 'checkin_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkinTime: Date;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  // Relations
  @ManyToOne(() => Guest, (guest) => guest.checkins)
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;
}
