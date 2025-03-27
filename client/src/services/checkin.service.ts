import { GuestCheckIn, CheckInResponse } from '@/types/checkin';
import { API_BASE_URL } from '@/config/env';

export class CheckInService {
  private static instance: CheckInService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_BASE_URL}/api/checkin`;
  }

  public static getInstance(): CheckInService {
    if (!CheckInService.instance) {
      CheckInService.instance = new CheckInService();
    }
    return CheckInService.instance;
  }

  async uploadGuestImage(guestImage: string): Promise<string> {
    const response = await fetch()
  }

  async checkInGuest(data: GuestCheckIn): Promise<CheckInResponse> {
    try {
    
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to check in guest');
      }

      return await response.json();
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  async getGuestList(): Promise<CheckInResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch guest list');
      }

      return await response.json();
    } catch (error) {
      console.error('Get guest list error:', error);
      throw error;
    }
  }
}
