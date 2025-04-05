
export enum EventStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Event {
  eventId: string;
  eventCode: string;
  eventName: string;
  tenantCode: string;
  eventDescription: string | null;
  eventStatus: EventStatus;
  startTime: string;
  endTime: string;
  eventImg: string | null;
  venueName: string;
  venueAddress: string | null;
  capacity: number | null;
  eventType: string | null;
  termsConditions: string | null;
  floorPlanImg: string | null;
  enabled: boolean;
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