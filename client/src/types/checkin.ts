export interface GuestCheckIn {
  guestCode: string;
  eventCode: string;
  pocId: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  purpose?: string;
  notes?: string;
  imageUrl?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data?: GuestCheckinData | GuestCheckinData[];
}

export interface GuestCheckinData {
  id: string;
  guestId: string;
  eventCode: string;
  pocId: string;
  notes?: string;
  imageUrl?: string;
  checkInTime: string;
  status: 'Checked In' | 'Registered';
  guest?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    purpose: string;
    guestCode: string;
  };
}
