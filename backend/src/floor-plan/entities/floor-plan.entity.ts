import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { PocLocation } from '../../poc/entities/poc-location.entity';

@Entity('floor_plans')
export class FloorPlan {
  @PrimaryGeneratedColumn('uuid', { name: 'floor_plan_id' })
  floorPlanId: string;

  @Column({ name: 'floor_plan_image_url' })
  floorPlanImageUrl: string;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  // Relations
  @OneToOne(() => Event, (event) => event.floorPlan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id', referencedColumnName: 'eventId' })
  event: Event;

  @OneToMany(() => PocLocation, (pocLocation) => pocLocation.floorPlan, {
    cascade: true,
  })
  locations: PocLocation[];
}
