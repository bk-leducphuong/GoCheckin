export interface Event {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  notes?: string;
  checkInPoints: CheckInPoint[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckInPoint {
  id: string;
  name: string;
  location: string;
  pocId: string;
}

export interface CreateEventRequest {
  name: string;
  code: string;
  startDate: string;
  endDate: string;
  notes?: string;
  checkInPoints: Omit<CheckInPoint, 'id'>[];
}

export interface EventResponse {
  success: boolean;
  message: string;
  data?: Event;
} 