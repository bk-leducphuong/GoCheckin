# Event Check-in System API Design

## Base URLs
- Admin Portal: `https://admin.checkin.com/api`
- Company Portal: `https://poc.checkin.com/api`

## Authentication
All endpoints require authentication except for registration and login endpoints.

### Authentication Headers
```
Authorization: Bearer {token}
```

## Admin Portal API Endpoints

### Authentication

#### POST /auth/register
Register a new event organizer account.

**Request Body:**
```json
{
  "email": "string",
  "phone": "string",
  "password": "string",
  "name": "string",
  "company": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "userId": "uuid",
    "email": "string"
  }
}
```

#### POST /auth/login
Login for event organizers.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string"
    }
  }
}
```

### Event Management

#### GET /events
Get all events created by the organizer.

**Query Parameters:**
- `status`: Filter by event status (upcoming, ongoing, completed)
- `page`: Page number for pagination
- `limit`: Number of events per page

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "name": "string",
        "eventCode": "string",
        "startDate": "date",
        "endDate": "date",
        "location": "string",
        "totalCheckpoints": "number",
        "status": "string",
        "notes": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
}
```

#### POST /events
Create a new event.

**Request Body:**
```json
{
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "location": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "uuid",
    "eventCode": "string",
    "name": "string",
    "startDate": "date",
    "endDate": "date"
  }
}
```

#### GET /events/{eventId}
Get event details by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "eventCode": "string",
    "startDate": "date",
    "endDate": "date",
    "location": "string",
    "status": "string",
    "notes": "string",
    "floorPlan": "url",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

#### PUT /events/{eventId}
Update an existing event. Only available for events that haven't started yet.

**Request Body:**
```json
{
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "location": "string",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "eventCode": "string"
  }
}
```

#### DELETE /events/{eventId}
Delete an event. Only available for events that haven't started yet.

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Floor Plan Management

#### POST /events/{eventId}/floor-plan
Upload a floor plan for an event.

**Request Body:**
- Form data with `floorPlan` file

**Response:**
```json
{
  "success": true,
  "message": "Floor plan uploaded successfully",
  "data": {
    "floorPlanUrl": "string"
  }
}
```

#### GET /events/{eventId}/floor-plan
Get the floor plan for an event.

**Response:**
```json
{
  "success": true,
  "data": {
    "floorPlanUrl": "string"
  }
}
```

### Check-in Points Management

#### GET /events/{eventId}/checkpoints
Get all check-in points for an event.

**Response:**
```json
{
  "success": true,
  "data": {
    "checkpoints": [
      {
        "id": "uuid",
        "pocId": "string",
        "name": "string",
        "companyId": "uuid",
        "companyName": "string",
        "coordinates": {
          "x": "number",
          "y": "number"
        },
        "status": "string"
      }
    ]
  }
}
```

#### POST /events/{eventId}/checkpoints
Create a new check-in point for an event.

**Request Body:**
```json
{
  "name": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  },
  "companyId": "uuid",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in point created successfully",
  "data": {
    "id": "uuid",
    "pocId": "string",
    "name": "string"
  }
}
```

#### PUT /events/{eventId}/checkpoints/{checkpointId}
Update a check-in point.

**Request Body:**
```json
{
  "name": "string",
  "coordinates": {
    "x": "number",
    "y": "number"
  },
  "companyId": "uuid",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in point updated successfully"
}
```

#### DELETE /events/{eventId}/checkpoints/{checkpointId}
Delete a check-in point.

**Response:**
```json
{
  "success": true,
  "message": "Check-in point deleted successfully"
}
```

### Companies Management

#### GET /events/{eventId}/companies
Get all companies participating in an event.

**Response:**
```json
{
  "success": true,
  "data": {
    "companies": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "checkpointCount": "number"
      }
    ]
  }
}
```

#### POST /events/{eventId}/companies
Register a company for an event.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "contact": "string",
  "industry": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company registered successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "accessCode": "string"
  }
}
```

### Guests Management

#### GET /events/{eventId}/guests
Get all guests registered for an event.

**Query Parameters:**
- `page`: Page number
- `limit`: Number of guests per page
- `search`: Search by name or card ID

**Response:**
```json
{
  "success": true,
  "data": {
    "guests": [
      {
        "id": "uuid",
        "cardId": "string",
        "name": "string",
        "email": "string",
        "checkinsCount": "number"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
}
```

#### POST /events/{eventId}/guests
Register a new guest for an event.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "company": "string",
  "type": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Guest registered successfully",
  "data": {
    "id": "uuid",
    "cardId": "string",
    "name": "string"
  }
}
```

### Analytics

#### GET /events/{eventId}/analytics/checkins
Get check-in statistics for an event.

**Query Parameters:**
- `timeFrame`: hourly, daily, total
- `startDate`: filter by start date
- `endDate`: filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCheckins": "number",
    "uniqueGuests": "number",
    "timeDistribution": [
      {
        "timestamp": "datetime",
        "count": "number"
      }
    ],
    "demographicData": {
      "male": "number",
      "female": "number",
      "unidentified": "number"
    }
  }
}
```

#### GET /events/{eventId}/analytics/heatmap
Get a heatmap of check-ins by location.

**Response:**
```json
{
  "success": true,
  "data": {
    "checkpoints": [
      {
        "id": "uuid",
        "pocId": "string",
        "name": "string",
        "coordinates": {
          "x": "number",
          "y": "number"
        },
        "checkinCount": "number"
      }
    ]
  }
}
```

#### GET /events/{eventId}/analytics/guest-paths
Get guest movement patterns through the event.

**Query Parameters:**
- `limit`: Number of paths to return

**Response:**
```json
{
  "success": true,
  "data": {
    "paths": [
      {
        "guestId": "uuid",
        "cardId": "string",
        "path": [
          {
            "checkpointId": "uuid",
            "pocId": "string",
            "name": "string",
            "timestamp": "datetime"
          }
        ]
      }
    ]
  }
}
```

## Company Portal API Endpoints

### Authentication

#### POST /auth/login
Login for companies participating in events.

**Request Body:**
```json
{
  "eventCode": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string",
    "company": {
      "id": "uuid",
      "name": "string",
      "eventId": "uuid",
      "eventName": "string"
    }
  }
}
```

### Check-in Management

#### GET /checkpoints
Get all check-in points assigned to the company.

**Response:**
```json
{
  "success": true,
  "data": {
    "checkpoints": [
      {
        "id": "uuid",
        "pocId": "string",
        "name": "string",
        "location": "string",
        "deviceId": "string"
      }
    ]
  }
}
```

#### POST /checkins
Register a new check-in.

**Request Body:**
```json
{
  "cardId": "string",
  "deviceId": "string",
  "image": "base64",
  "notes": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in registered successfully",
  "data": {
    "id": "uuid",
    "timestamp": "datetime",
    "guestInfo": {
      "id": "uuid",
      "cardId": "string"
    }
  }
}
```

#### GET /checkins
Get all check-ins for the company.

**Query Parameters:**
- `checkpointId`: Filter by checkpoint
- `startDate`: Filter by start date
- `endDate`: Filter by end date
- `page`: Page number
- `limit`: Number of check-ins per page

**Response:**
```json
{
  "success": true,
  "data": {
    "checkins": [
      {
        "id": "uuid",
        "timestamp": "datetime",
        "cardId": "string",
        "checkpointId": "uuid",
        "pocId": "string",
        "image": "url",
        "notes": "string",
        "demographics": {
          "gender": "string",
          "ageRange": "string"
        }
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
}
```

### Analytics

#### GET /analytics/overview
Get an overview of check-in analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCheckins": "number",
    "uniqueGuests": "number",
    "checkinsPerHour": [
      {
        "hour": "number",
        "count": "number"
      }
    ],
    "demographicData": {
      "gender": {
        "male": "number",
        "female": "number",
        "unidentified": "number"
      }
    }
  }
}
```

#### GET /analytics/time-distribution
Get check-in distribution by time.

**Query Parameters:**
- `interval`: hourly, daily
- `startDate`: filter by start date
- `endDate`: filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "timeDistribution": [
      {
        "timestamp": "datetime",
        "count": "number"
      }
    ]
  }
}
```

#### GET /analytics/demographics
Get demographic analysis of check-ins.

**Response:**
```json
{
  "success": true,
  "data": {
    "gender": {
      "male": "number",
      "female": "number",
      "unidentified": "number"
    },
    "estimatedAgeGroups": {
      "under18": "number",
      "18to24": "number",
      "25to34": "number",
      "35to44": "number",
      "45to54": "number",
      "55plus": "number"
    }
  }
}
```

### Devices Management

#### GET /devices
Get all devices assigned to the company.

**Response:**
```json
{
  "success": true,
  "data": {
    "devices": [
      {
        "id": "uuid",
        "deviceId": "string",
        "checkpointId": "uuid",
        "pocId": "string",
        "status": "string",
        "lastActive": "datetime"
      }
    ]
  }
}
```

#### POST /devices/register
Register a new device.

**Request Body:**
```json
{
  "deviceId": "string",
  "checkpointId": "uuid",
  "deviceInfo": {
    "model": "string",
    "os": "string",
    "macAddress": "string"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "id": "uuid",
    "deviceId": "string"
  }
}
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

Common error codes:
- `AUTH_FAILED`: Authentication failure
- `INVALID_INPUT`: Invalid input parameters
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Permission denied
- `SERVER_ERROR`: Internal server error

## Synchronization API for Offline Mode

### POST /sync
Sync offline check-ins with the server.

**Request Body:**
```json
{
  "deviceId": "string",
  "checkins": [
    {
      "cardId": "string",
      "timestamp": "datetime",
      "image": "base64",
      "notes": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sync completed successfully",
  "data": {
    "syncedCount": "number",
    "failedCount": "number",
    "failedItems": [
      {
        "index": "number",
        "reason": "string"
      }
    ]
  }
}
```