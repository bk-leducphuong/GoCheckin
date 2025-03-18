import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { GuestCheckin } from './guest-checkin.entity';

export enum IdentityType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  OTHER = 'other',
}

export enum GuestType {
  REGULAR = 'regular',
  VIP = 'vip',
  SPEAKER = 'speaker',
  SPONSOR = 'sponsor',
}

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn('uuid', { name: 'guest_id' })
  guestId: string;

  @Column({ name: 'guest_code', type: 'varchar', length: 50 })
  guestCode: string;

  @Column({ name: 'event_code', type: 'varchar', length: 50 })
  eventCode: string;

  @Column({ name: 'point_code', type: 'varchar', length: 50 })
  pointCode: string;

  @Column({
    name: 'guest_description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  guestDescription: string;

  @Column({ name: 'front_img', type: 'bytea', nullable: true })
  frontImg: Buffer;

  @Column({ name: 'back_img', type: 'bytea', nullable: true })
  backImg: Buffer;

  @Column({
    name: 'identity_type',
    type: 'enum',
    enum: IdentityType,
  })
  identityType: IdentityType;

  @Column({
    name: 'guest_type',
    type: 'enum',
    enum: GuestType,
    default: GuestType.REGULAR,
  })
  guestType: GuestType;

  @Column({ name: 'age_range', type: 'varchar', length: 20, nullable: true })
  ageRange: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({
    name: 'registration_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  registrationDate: Date;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => GuestCheckin, (checkin) => checkin.guest)
  checkins: GuestCheckin[];
}
