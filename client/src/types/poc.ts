export interface Poc {
  pocId: string;
  pointCode: string;
  pointName: string;
  pointNode?: string;
  eventCode: string;
  userId: string;
  latitude?: string;
  longitude?: string;
  capacity?: string;
  status: string;
  openTime?: string;
  closeTime?: string;
  locationDescription?: string;
  floorLevel?: string;
  enabled: boolean;
  createdAt: string;
  updatAt: string;
}

export interface PocValidationData {
  pointCode: string;
  eventCode: string;
}

export interface CreatePocRequest {
  pointCode: string;
  pointName: string;
  latitude?: string;
  longitude?: string;
  capacity?: string;
  status?: string;
  openTime?: string;
  closeTime?: string;
  locationDescription?: string;
  floorLevel?: string;
}

export interface UpdatePocRequest {
  pointCode?: string;
  pointName?: string;
  pointNode?: string;
  latitude?: string;
  longitude?: string;
  capacity?: string;
  status?: string;
  openTime?: string;
  closeTime?: string;
  locationDescription?: string;
  floorLevel?: string;
}

export interface PocManager {
  userId: string;
  username: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
  companyName?: string;
  createdAt: string;
}

export interface PocLocation {
  pocLocationId?: string;
  floorPlanId?: string;
  pocId: string;
  label: string;
  xCoordinate: number;
  yCoordinate: number;
}

export interface PocLocations {
  eventCode: string;
  locations: PocLocation[];
}

export interface RegisterPocUserRequest {
  eventCode: string;
  pointCode: string;
}

export interface SendPocInviteRequest {
  eventCode: string;
  pointCode: string;
  email: string;
}

export enum PocInviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

export interface PocInvite {
  id: string;
  eventCode: string;
  pointCode: string;
  email: string;
  status: PocInviteStatus;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}
