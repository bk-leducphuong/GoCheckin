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
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Guest } from '../../guest/entities/guest.entity';
import { PointCheckinAnalytics } from '../../analysis/entities/point-checkin-analytics.entity';
import { EventCheckinAnalytics } from '../../analysis/entities/event-checkin-analytics.entity';
import { FloorPlan } from '../../floor-plan/entities/floor-plan.entity';

export enum EventStatus {
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EventType {
  CONFERENCE = 'conference',
  WORKSHOP = 'workshop',
  MEETING = 'meeting',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid', { name: 'event_id' })
  eventId: string;

  @Column({ name: 'event_code', length: 50, unique: true })
  eventCode: string;

  @Column({ name: 'event_name', length: 255 })
  eventName: string;

  @Column({ name: 'tenant_code', length: 50 })
  tenantCode: string;

  @Column({ name: 'event_description', type: 'text', nullable: true })
  eventDescription: string;

  @Column({
    name: 'event_status',
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.PUBLISHED,
  })
  eventStatus: EventStatus;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'venue_name', length: 255, nullable: true })
  venueName: string;

  @Column({ name: 'venue_address', type: 'text', nullable: true })
  venueAddress: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: EventType,
    nullable: true,
  })
  eventType: EventType;

  @Column({ name: 'terms_conditions', type: 'text', nullable: true })
  termsConditions: string;

  @Column('simple-array', { name: 'images', nullable: true })
  images: string[];

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.events)
  @JoinColumn({ name: 'tenant_code', referencedColumnName: 'tenantCode' })
  tenant: Tenant;

  @OneToMany(() => Guest, (guest) => guest.event)
  guests: Guest[];

  @OneToMany(
    () => PointCheckinAnalytics,
    (pointCheckinAnalytics) => pointCheckinAnalytics.event,
  )
  pointCheckinAnalytics: PointCheckinAnalytics[];

  @OneToMany(
    () => EventCheckinAnalytics,
    (eventCheckinAnalytics) => eventCheckinAnalytics.event,
  )
  eventCheckinAnalytics: EventCheckinAnalytics[];

  @OneToOne(() => FloorPlan, (floorPlan) => floorPlan.event)
  floorPlan: FloorPlan;
}
