export enum EventStatus {
  PUBLISHED = "published",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
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
  eventName: string;
  eventCode: string;
  startTime: string;
  endTime: string;
  eventDescription?: string;
  eventStatus?: EventStatus;
  venueName?: string;
  venueAddress?: string;
  capacity?: number;
  eventType?: string;
  termsConditions?: string;
  enabled?: boolean;
}

export interface EventResponse {
  success: boolean;
  message: string;
  data?: Event;
}
