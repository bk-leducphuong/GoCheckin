import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity'; // Adjust the import path as necessary
import { Poc } from '../../poc/entities/poc.entity'; // Adjust the import path as necessary

@Entity('point_checkin_analytics')
export class PointCheckinAnalytics {
  @PrimaryGeneratedColumn('uuid')
  analyticsId: string;

  @Column({ name: 'time_interval' })
  timeInterval: Date;

  @Column({ name: 'interval_duration', type: 'varchar' })
  intervalDuration: string;

  @Column({ name: 'checkin_count', type: 'int', default: 0 })
  checkinCount: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'poc_id', type: 'uuid' })
  pocId: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  // Relations
  @ManyToOne(() => Event, (event) => event.pointCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'eventId' })
  event: Event;

  @ManyToOne(() => Poc, (poc) => poc.pointCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poc_id', referencedColumnName: 'pocId' })
  poc: Poc;
}
