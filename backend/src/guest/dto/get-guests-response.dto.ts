import { ApiProperty } from '@nestjs/swagger';
import { Guest } from '../entities/guest.entity';
import { GuestCheckin } from '../entities/guest-checkin.entity';

export class GuestResponse {
  @ApiProperty({ type: Guest })
  guestInfo: Guest;

  @ApiProperty({ type: GuestCheckin })
  checkinInfo: GuestCheckin;
}
