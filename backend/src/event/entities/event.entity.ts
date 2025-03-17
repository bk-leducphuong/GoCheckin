import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tenant } from '../../tenant/entities/tenant.entity';

export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
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
    default: EventStatus.DRAFT,
  })
  eventStatus: EventStatus;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  endTime: Date;

  @Column({ name: 'event_img', type: 'bytea', nullable: true })
  eventImg: Buffer;

  @Column({ name: 'venue_name', length: 255, nullable: true })
  venueName: string;

  @Column({ name: 'venue_address', type: 'text', nullable: true })
  venueAddress: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ name: 'event_type', length: 100, nullable: true })
  eventType: string;

  @Column({ name: 'terms_conditions', type: 'text', nullable: true })
  termsConditions: string;

  @Column({ name: 'floor_plan_img', type: 'bytea', nullable: true })
  floorPlanImg: Buffer;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Tenant, (tenant) => tenant.events)
  @JoinColumn({ name: 'tenant_code', referencedColumnName: 'tenantCode' })
  tenant: Tenant;
}
