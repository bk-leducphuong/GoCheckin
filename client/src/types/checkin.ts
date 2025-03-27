export interface GuestCheckIn {
  name: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  guestCode: string;
  notes?: string;
  photo?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    purpose: string;
    guestCode: string;
    notes?: string;
    photo?: string;
    checkInTime: string;
    status: 'Checked In' | 'Registered';
  };
}
