import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { PointOfCheckin } from 'src/poc/entities/poc.entity';
import { FloorPlan } from '../../floor-plan/entities/floor-plan.entity';

@Entity('poc_locations')
export class PocLocation {
  @PrimaryGeneratedColumn('uuid', { name: 'poc_location_id' })
  pocLocationId: string;

  @Column({ name: 'floor_plan_id', type: 'uuid' })
  floorPlanId: string;

  @Column({ name: 'poc_id', type: 'uuid' })
  pocId: string;

  @Column({ name: 'label', type: 'varchar' })
  label: string;

  @Column({ name: 'x_coordinate', type: 'float', nullable: true })
  xCoordinate: number;

  @Column({ name: 'y_coordinate', type: 'float', nullable: true })
  yCoordinate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => PointOfCheckin, (poc) => poc.location, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poc_id' })
  poc: PointOfCheckin;

  @ManyToOne(() => FloorPlan, (floorPlan) => floorPlan.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'floor_plan_id' })
  floorPlan: FloorPlan;
}
