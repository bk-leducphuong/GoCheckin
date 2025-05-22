import { UserRole } from '../src/account/entities/account.entity';
import { EventStatus, EventType } from '../src/event/entities/event.entity';
import { GuestStatus } from '../src/guest/entities/guest.entity';
import { TokenType } from '../src/auth/entities/token.entity';

// Current date without milliseconds for consistent comparison
const NOW = new Date();
NOW.setMilliseconds(0);

// Fixed dates for testing
const YESTERDAY = new Date(NOW);
YESTERDAY.setDate(YESTERDAY.getDate() - 1);

const TOMORROW = new Date(NOW);
TOMORROW.setDate(TOMORROW.getDate() + 1);

const NEXT_WEEK = new Date(NOW);
NEXT_WEEK.setDate(NEXT_WEEK.getDate() + 7);

const LAST_WEEK = new Date(NOW);
LAST_WEEK.setDate(LAST_WEEK.getDate() - 7);

// Account Entity
export const mockAccounts = [
  {
    userId: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
    email: 'admin@example.com',
    password: '$2b$10$examplehashedpasswordforadmin',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    accountTenants: [],
  },
  {
    userId: '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q',
    email: 'tenant@example.com',
    password: '$2b$10$examplehashedpasswordfortenant',
    fullName: 'Tenant User',
    role: UserRole.TENANT,
    isActive: true,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    accountTenants: [],
  },
  {
    userId: '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r',
    email: 'poc@example.com',
    password: '$2b$10$examplehashedpasswordforpoc',
    fullName: 'POC User',
    role: UserRole.POC,
    isActive: true,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    accountTenants: [],
  },
];

// Tenant Entity
export const mockTenants = [
  {
    tenantId: '1b2c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q',
    tenantCode: 'TENANT-1',
    tenantName: 'Test Tenant 1',
    description: 'This is test tenant 1',
    contactEmail: 'contact@tenant1.com',
    contactPhone: '1234567890',
    logoUrl: 'https://example.com/tenant1-logo.png',
    websiteUrl: 'https://tenant1.com',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    events: [],
    accountTenants: [],
  },
  {
    tenantId: '2c3d4e5f-6g7h-8i9j-0k1l-2m3n4o5p6q7r',
    tenantCode: 'TENANT-2',
    tenantName: 'Test Tenant 2',
    description: 'This is test tenant 2',
    contactEmail: 'contact@tenant2.com',
    contactPhone: '0987654321',
    logoUrl: 'https://example.com/tenant2-logo.png',
    websiteUrl: 'https://tenant2.com',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    events: [],
    accountTenants: [],
  },
];

// Account Tenant Entity
export const mockAccountTenants = [
  {
    id: '1d2e3f4g-5h6i-7j8k-9l0m-1n2o3p4q5r6s',
    userId: mockAccounts[0].userId,
    tenantCode: mockTenants[0].tenantCode,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    account: mockAccounts[0],
    tenant: mockTenants[0],
  },
  {
    id: '2e3f4g5h-6i7j-8k9l-0m1n-2o3p4q5r6s7t',
    userId: mockAccounts[1].userId,
    tenantCode: mockTenants[1].tenantCode,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    account: mockAccounts[1],
    tenant: mockTenants[1],
  },
];

// Event Entity
export const mockEvents = [
  {
    eventId: '1f2g3h4i-5j6k-7l8m-9n0o-1p2q3r4s5t6u',
    eventCode: 'EVENT-1',
    eventName: 'Conference 2023',
    tenantCode: mockTenants[0].tenantCode,
    eventDescription: 'Annual tech conference',
    eventStatus: EventStatus.PUBLISHED,
    startTime: TOMORROW,
    endTime: NEXT_WEEK,
    venueName: 'Grand Hotel',
    venueAddress: '123 Main St, City, Country',
    capacity: 500,
    eventType: EventType.CONFERENCE,
    termsConditions: 'Standard terms and conditions apply',
    images: ['event1-image1.jpg', 'event1-image2.jpg'],
    enabled: true,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
    tenant: mockTenants[0],
    guests: [],
    pointCheckinAnalytics: [],
    eventCheckinAnalytics: [],
    floorPlan: null,
  },
  {
    eventId: '2g3h4i5j-6k7l-8m9n-0o1p-2q3r4s5t6u7v',
    eventCode: 'EVENT-2',
    eventName: 'Workshop 2023',
    tenantCode: mockTenants[0].tenantCode,
    eventDescription: 'Technical workshop',
    eventStatus: EventStatus.ACTIVE,
    startTime: YESTERDAY,
    endTime: TOMORROW,
    venueName: 'Tech Hub',
    venueAddress: '456 Tech St, City, Country',
    capacity: 100,
    eventType: EventType.WORKSHOP,
    termsConditions: 'Workshop terms and conditions apply',
    images: ['event2-image1.jpg'],
    enabled: true,
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
    tenant: mockTenants[0],
    guests: [],
    pointCheckinAnalytics: [],
    eventCheckinAnalytics: [],
    floorPlan: null,
  },
  {
    eventId: '3h4i5j6k-7l8m-9n0o-1p2q-3r4s5t6u7v8w',
    eventCode: 'EVENT-3',
    eventName: 'Business Meeting',
    tenantCode: mockTenants[1].tenantCode,
    eventDescription: 'Executive business meeting',
    eventStatus: EventStatus.COMPLETED,
    startTime: LAST_WEEK,
    endTime: YESTERDAY,
    venueName: 'Business Center',
    venueAddress: '789 Business Ave, City, Country',
    capacity: 50,
    eventType: EventType.MEETING,
    termsConditions: 'Confidentiality agreement required',
    images: [],
    enabled: true,
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
    tenant: mockTenants[1],
    guests: [],
    pointCheckinAnalytics: [],
    eventCheckinAnalytics: [],
    floorPlan: null,
  },
];

// Point of Checkin Entity
export const mockPointsOfCheckin = [
  {
    pocId: '1h2i3j4k-5l6m-7n8o-9p0q-1r2s3t4u5v6w',
    pocCode: 'POC-1',
    pocName: 'Main Entrance',
    eventCode: mockEvents[0].eventCode,
    description: 'Main entrance check-in point',
    status: true,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
    event: mockEvents[0],
    checkins: [],
    location: null,
  },
  {
    pocId: '2i3j4k5l-6m7n-8o9p-0q1r-2s3t4u5v6w7x',
    pocCode: 'POC-2',
    pocName: 'VIP Entrance',
    eventCode: mockEvents[0].eventCode,
    description: 'VIP entrance check-in point',
    status: true,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
    event: mockEvents[0],
    checkins: [],
    location: null,
  },
  {
    pocId: '3j4k5l6m-7n8o-9p0q-1r2s-3t4u5v6w7x8y',
    pocCode: 'POC-3',
    pocName: 'Workshop Room',
    eventCode: mockEvents[1].eventCode,
    description: 'Workshop room check-in point',
    status: true,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    event: mockEvents[1],
    checkins: [],
    location: null,
  },
];

// POC Location Entity
export const mockPocLocations = [
  {
    id: '1j2k3l4m-5n6o-7p8q-9r0s-1t2u3v4w5x6y',
    pocId: mockPointsOfCheckin[0].pocId,
    x: 100,
    y: 150,
    poc: mockPointsOfCheckin[0],
  },
  {
    id: '2k3l4m5n-6o7p-8q9r-0s1t-2u3v4w5x6y7z',
    pocId: mockPointsOfCheckin[1].pocId,
    x: 200,
    y: 250,
    poc: mockPointsOfCheckin[1],
  },
];

// Guest Entity
export const mockGuests = [
  {
    guestId: '1k2l3m4n-5o6p-7q8r-9s0t-1u2v3w4x5y6z',
    guestCode: 'GUEST-1',
    eventCode: mockEvents[0].eventCode,
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '1234567890',
    status: GuestStatus.REGISTERED,
    type: 'Regular',
    imageUrl: 'https://example.com/john.jpg',
    qrCode: 'data:image/png;base64,QR_CODE_DATA_1',
    description: 'VIP guest',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    event: mockEvents[0],
    checkins: [],
  },
  {
    guestId: '2l3m4n5o-6p7q-8r9s-0t1u-2v3w4x5y6z7a',
    guestCode: 'GUEST-2',
    eventCode: mockEvents[0].eventCode,
    name: 'Jane Smith',
    email: 'jane@example.com',
    phoneNumber: '0987654321',
    status: GuestStatus.CHECKED_IN,
    type: 'Regular',
    imageUrl: 'https://example.com/jane.jpg',
    qrCode: 'data:image/png;base64,QR_CODE_DATA_2',
    description: 'Speaker',
    createdAt: LAST_WEEK,
    updatedAt: YESTERDAY,
    event: mockEvents[0],
    checkins: [],
  },
  {
    guestId: '3m4n5o6p-7q8r-9s0t-1u2v-3w4x5y6z7a8b',
    guestCode: 'GUEST-3',
    eventCode: mockEvents[1].eventCode,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    phoneNumber: '5551234567',
    status: GuestStatus.CHECKED_IN,
    type: 'Workshop',
    imageUrl: 'https://example.com/bob.jpg',
    qrCode: 'data:image/png;base64,QR_CODE_DATA_3',
    description: 'Workshop attendee',
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    event: mockEvents[1],
    checkins: [],
  },
];

// Guest Checkin Entity
export const mockGuestCheckins = [
  {
    id: '1m2n3o4p-5q6r-7s8t-9u0v-1w2x3y4z5a6b',
    guestId: mockGuests[1].guestId,
    pocId: mockPointsOfCheckin[0].pocId,
    checkinTime: YESTERDAY,
    guest: mockGuests[1],
    poc: mockPointsOfCheckin[0],
  },
];

// Floor Plan Entity
export const mockFloorPlans = [
  {
    id: '1n2o3p4q-5r6s-7t8u-9v0w-1x2y3z4a5b6c',
    eventCode: mockEvents[0].eventCode,
    imageUrl: 'https://example.com/floor-plan1.jpg',
    width: 1000,
    height: 800,
    createdAt: LAST_WEEK,
    updatedAt: LAST_WEEK,
    event: mockEvents[0],
  },
];

// Token Entity
export const mockTokens = [
  {
    id: '1o2p3q4r-5s6t-7u8v-9w0x-1y2z3a4b5c6d',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYTJiM2M0ZC01ZTZmLTdnOGgtOWkwai0xazJsM200bjVvNnAiLCJpYXQiOjE2MjM0NTY3ODksImV4cCI6MTYyMzQ2MDM4OX0.exampletoken1',
    userId: mockAccounts[0].userId,
    tokenType: TokenType.REFRESH,
    expiresAt: NEXT_WEEK,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
  },
  {
    id: '2p3q4r5s-6t7u-8v9w-0x1y-2z3a4b5c6d7e',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyYjNjNGQ1ZS02ZjdnLThoOWktMGoxay0ybDNtNG41bzZwN3EiLCJpYXQiOjE2MjM0NTY3ODksImV4cCI6MTYyMzQ2MDM4OX0.exampletoken2',
    userId: mockAccounts[1].userId,
    tokenType: TokenType.REFRESH,
    expiresAt: NEXT_WEEK,
    createdAt: YESTERDAY,
    updatedAt: YESTERDAY,
  },
];

// OTP Entity
export const mockOtps = [
  {
    id: '1p2q3r4s-5t6u-7v8w-9x0y-1z2a3b4c5d6e',
    email: mockAccounts[0].email,
    otp: '123456',
    expiresAt: TOMORROW,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// Reset Token Entity
export const mockResetTokens = [
  {
    id: '1q2r3s4t-5u6v-7w8x-9y0z-1a2b3c4d5e6f',
    email: mockAccounts[1].email,
    token: 'reset-token-123456',
    expiresAt: TOMORROW,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

// Event Checkin Analytics Entity
export const mockEventCheckinAnalytics = [
  {
    id: '1r2s3t4u-5v6w-7x8y-9z0a-1b2c3d4e5f6g',
    eventCode: mockEvents[0].eventCode,
    date: NOW,
    checkinsCount: 25,
    uniqueGuestsCount: 25,
    event: mockEvents[0],
  },
  {
    id: '2s3t4u5v-6w7x-8y9z-0a1b-2c3d4e5f6g7h',
    eventCode: mockEvents[1].eventCode,
    date: NOW,
    checkinsCount: 10,
    uniqueGuestsCount: 10,
    event: mockEvents[1],
  },
];

// Point Checkin Analytics Entity
export const mockPointCheckinAnalytics = [
  {
    id: '1t2u3v4w-5x6y-7z8a-9b0c-1d2e3f4g5h6i',
    eventCode: mockEvents[0].eventCode,
    pocCode: mockPointsOfCheckin[0].pocCode,
    date: NOW,
    checkinsCount: 15,
    event: mockEvents[0],
    pocId: mockPointsOfCheckin[0].pocId,
  },
  {
    id: '2u3v4w5x-6y7z-8a9b-0c1d-2e3f4g5h6i7j',
    eventCode: mockEvents[0].eventCode,
    pocCode: mockPointsOfCheckin[1].pocCode,
    date: NOW,
    checkinsCount: 10,
    event: mockEvents[0],
    pocId: mockPointsOfCheckin[1].pocId,
  },
];

// Combined mock data
export const mockData = {
  accounts: mockAccounts,
  tenants: mockTenants,
  accountTenants: mockAccountTenants,
  events: mockEvents,
  pointsOfCheckin: mockPointsOfCheckin,
  pocLocations: mockPocLocations,
  guests: mockGuests,
  guestCheckins: mockGuestCheckins,
  floorPlans: mockFloorPlans,
  tokens: mockTokens,
  otps: mockOtps,
  resetTokens: mockResetTokens,
  eventCheckinAnalytics: mockEventCheckinAnalytics,
  pointCheckinAnalytics: mockPointCheckinAnalytics,
};

// Helper function to get mock data by ID for any entity
export function getMockById<T extends { [key: string]: any }>(
  collection: T[],
  idField: keyof T,
  idValue: string,
): T | undefined {
  return collection.find((item) => item[idField] === idValue);
}

// Helper function to get related data
export function getRelatedMockData<T extends { [key: string]: any }>(
  collection: T[],
  relationField: keyof T,
  relationValue: string,
): T[] {
  return collection.filter((item) => item[relationField] === relationValue);
}

// Helper function to clone mock data to avoid modifying the original
export function cloneMockData<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
