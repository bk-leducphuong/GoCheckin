import { Column, Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Event } from '../../event/entities/event.entity'; // Adjust the import path as necessary
import { PointOfCheckin } from '../../poc/entities/poc.entity'; // Adjust the import path as necessary

@Entity('point_checkin_analytics')
export class PointCheckinAnalytics {
  @PrimaryColumn({ name: 'analytics_id', type: 'uuid' })
  analyticsId: string;

  @Column({ name: 'point_code', type: 'varchar' })
  pointCode: string;

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

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

  @ManyToOne(() => Event, (event) => event.pointCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  event: Event; // Assuming you have an Event entity defined somewhere

  @ManyToOne(() => PointOfCheckin, (point) => point.pointCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  point: PointOfCheckin; // Assuming you have a PointCheckinAnalytics entity defined somewhere
}
