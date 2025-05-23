export enum EventStatus {
  PUBLISHED = "published",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum EventType {
  CONFERENCE = "conference",
  WORKSHOP = "workshop",
  MEETING = "meeting",
}

export enum AccessType {
  PUBLIC = "public",
  PRIVATE = "private",
}

export interface EventContraints {
  status?: EventStatus;
  type?: EventType;
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
  venueName: string;
  venueAddress: string | null;
  capacity: number | null;
  termsConditions: string | null;
  accessType: AccessType;
  images: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventData {
  eventName: string;
  eventCode: string;
  startTime: string;
  endTime: string;
  eventDescription: string;
  eventStatus: EventStatus;
  venueName: string;
  venueAddress: string;
  capacity: number;
  termsConditions: string;
  accessType: AccessType;
  images: string[];
}

export interface CheckInPoint {
  id: string;
  name: string;
  location: string;
  pocId: string;
}

export interface UpdateEventData {
  eventCode?: string;
  eventName?: string;
  startTime?: string;
  endTime?: string;
  eventDescription?: string;
  eventStatus?: EventStatus;
  venueName?: string;
  venueAddress?: string;
  capacity?: number;
  eventType?: EventType;
  termsConditions?: string;
  accessType?: AccessType;
  images?: string[];
}

export interface EventResponse {
  success: boolean;
  message: string;
  data?: Event;
}
