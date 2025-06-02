import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Guest } from './guest.entity';
import { Poc } from 'src/poc/entities/poc.entity';
import { Event } from 'src/event/entities/event.entity';

@Entity('guest_checkins')
export class GuestCheckin {
  @PrimaryGeneratedColumn('uuid', { name: 'checkin_id' })
  checkinId: string;

  @Column({ name: 'guest_id', type: 'uuid' })
  guestId: string;

  @Column({ name: 'guest_code', type: 'varchar' })
  guestCode: string;

  @CreateDateColumn({
    name: 'checkin_time',
    default: () => 'CURRENT_TIMESTAMP',
  })
  checkinTime: Date;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'poc_id', type: 'uuid' })
  pocId: string;

  // Relations
  @ManyToOne(() => Guest, (guest) => guest.checkins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'guest_id' })
  guest: Guest;

  @ManyToOne(() => Poc, (poc) => poc.guestCheckins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poc_id', referencedColumnName: 'pocId' })
  poc: Poc;

  @ManyToOne(() => Event, (event) => event.guestCheckins, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'eventId' })
  event: Event;
}
