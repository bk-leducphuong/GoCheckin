import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity'; // Adjust the import path as necessary
import { PointOfCheckin } from '../../poc/entities/poc.entity'; // Adjust the import path as necessary

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

  // Relations
  @ManyToOne(() => Event, (event) => event.pointCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_code', referencedColumnName: 'eventCode' })
  event: Event;

  @ManyToOne(() => PointOfCheckin, (point) => point.pointCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'point_code', referencedColumnName: 'pointCode' })
  point: PointOfCheckin;
}
