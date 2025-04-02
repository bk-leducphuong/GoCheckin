import { GuestCheckIn, CheckInResponse, GuestCheckinData } from "@/types/checkin";
import api from "./api";

// CheckIn Service for handling check-in operations
export const CheckInService = {
  async uploadGuestImage(guestImage: string | null): Promise<string> {
    if (!guestImage) return '';
    
    try {
      // Convert base64 to blob if needed
      const formData = new FormData();
      
      // If it's a data URL, extract the base64 part
      if (guestImage.startsWith('data:')) {
        const base64Data = guestImage.split(',')[1];
        const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(res => res.blob());
        formData.append('image', blob, 'guest-image.jpg');
      } else {
        // It's a string value, just send it as is
        formData.append('guestImage', guestImage);
      }

      const response = await api.post('/guests/checkin/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data;
    } catch (error) {
      console.error('Upload image error:', error);
      throw error;
    }
  },

  async checkinGuest(checkinDto: GuestCheckIn): Promise<CheckInResponse> {
    try {
      const response = await api.post('/guests/checkin', checkinDto, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  },

  async getGuestList(eventCode: string, pocId: string): Promise<{ success: boolean; message: string; data: GuestCheckinData[] }> {
    try {
      const response = await api.get(`/guests/poc-checkins?eventCode=${eventCode}&pocId=${pocId}`);
      return response.data.data;
    } catch (error) {
      console.error('Get guest list error:', error);
      throw error;
    }
  },
};
