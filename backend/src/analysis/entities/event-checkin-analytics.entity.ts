import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Event } from '../../event/entities/event.entity'; // Adjust the import path as necessary

@Entity('event_checkin_analytics')
export class EventCheckinAnalytics {
  @PrimaryGeneratedColumn('uuid')
  analyticsId: string;

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

  @Column({ name: 'time_interval' })
  timeInterval: Date;

  @Column({ name: 'interval_duration', type: 'varchar' })
  intervalDuration: string;

  @Column({ name: 'checkin_count', type: 'int', default: 0 })
  checkinCount: number;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.eventCheckinAnalytics, {
    onDelete: 'CASCADE',
  })
  event: Event; // Assuming you have an Event entity defined somewhere
}
