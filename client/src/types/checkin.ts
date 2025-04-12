import { GuestInfo } from './guest';

export interface GuestCheckinInfo {
  guestCode: string;
  eventCode: string;
  pointCode: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  purpose?: string;
  notes?: string;
  imageUrl?: string;
}

export interface CheckinInfo {
  checkinId: string;
  guestId: string;
  guestCode: string;
  pointCode: string;
  eventCode: string;
  checkinTime: string;
  active: boolean;
}

export interface CheckInResponse {
  guestInfo: GuestInfo;
  checkinInfo: CheckinInfo;
}
