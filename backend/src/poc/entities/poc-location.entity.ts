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
import { Poc } from 'src/poc/entities/poc.entity';
import { FloorPlan } from '../../floor-plan/entities/floor-plan.entity';

@Entity('poc_locations')
export class PocLocation {
  @PrimaryGeneratedColumn('uuid', { name: 'poc_location_id' })
  pocLocationId: string;

  @Column({ name: 'label', type: 'varchar', nullable: true })
  label: string;

  @Column({ name: 'x_coordinate', type: 'float', nullable: true })
  xCoordinate: number;

  @Column({ name: 'y_coordinate', type: 'float', nullable: true })
  yCoordinate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'floor_plan_id', type: 'uuid' })
  floorPlanId: string;

  @Column({ name: 'poc_id', type: 'uuid' })
  pocId: string;

  // Relations
  @OneToOne(() => Poc, (poc) => poc.location, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'poc_id', referencedColumnName: 'pocId' })
  poc: Poc;

  @ManyToOne(() => FloorPlan, (floorPlan) => floorPlan.locations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'floor_plan_id', referencedColumnName: 'floorPlanId' })
  floorPlan: FloorPlan;
}
