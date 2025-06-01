import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GuestCheckin } from './guest-checkin.entity';
import { Event } from '../../event/entities/event.entity';

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

  @Column({ name: 'guest_code', type: 'varchar', length: 255, nullable: false })
  guestCode: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'identity_type',
    type: 'enum',
    enum: IdentityType,
    default: IdentityType.ID_CARD,
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'event_code', type: 'varchar' })
  eventCode: string;

  // Relations
  @ManyToOne(() => Event, (event) => event.guests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'event_code', referencedColumnName: 'eventCode' })
  event: Event;

  @OneToMany(() => GuestCheckin, (checkin) => checkin.guest, {
    cascade: true,
  })
  checkins: GuestCheckin[];
}
