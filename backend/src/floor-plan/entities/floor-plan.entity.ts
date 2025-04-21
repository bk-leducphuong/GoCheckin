import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Event } from '../../event/entities/event.entity';
import { PocLocation } from './poc-location.entity';

@Entity('floor_plan')
export class FloorPlan {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'event_code' })
  eventCode: string;

  @Column({ name: 'floor_plan_image_url' })
  floorPlanImageUrl: string;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Event, (event) => event.floorPlan)
  event: Event;

  @OneToMany(() => PocLocation, (pocLocation) => pocLocation.floorPlan)
  locations: PocLocation[];
}
