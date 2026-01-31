# REST API Plan

## 1. Resources

### 1.1. Authentication & Authorization
- **Resource**: `auth` - User authentication and session management
- **Database Tables**: `users`, `sessions`

### 1.2. Users
- **Resource**: `users` - User account management
- **Database Table**: `users`

### 1.3. Devices
- **Resource**: `devices` - Device information
- **Database Table**: `devices`

### 1.4. Device State
- **Resource**: `device-state` - Current device state (temperatures, status)
- **Database Table**: `device_state`

### 1.5. Commands
- **Resource**: `commands` - Control commands for devices
- **Database Table**: `pending_commands`

### 1.6. ESP32 Communication
- **Resource**: `esp32` - ESP32-specific endpoints (data push/pull)
- **Database Tables**: `device_state`, `pending_commands`

---

## 2. Endpoints

### 2.1. Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string (required, max 50 chars, unique)",
  "password": "string (required, min length TBD)",
  "deviceId": "string (required, max 100 chars)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "operator1",
    "deviceId": "ESP32_001",
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input data, validation errors
- `409 Conflict`: Username already exists
- `500 Internal Server Error`: Server error

---

#### POST /api/auth/login
Authenticate user and create session.

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "token": "session_token_string",
  "expiresAt": "2024-01-01T13:00:00.000Z",
  "user": {
    "id": 1,
    "username": "operator1",
    "deviceId": "ESP32_001"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing username or password
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Server error

---

#### POST /api/auth/logout
Logout current user and invalidate session.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "operator1",
  "deviceId": "ESP32_001",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or expired token
- `500 Internal Server Error`: Server error

---

### 2.2. Device State Endpoints

#### GET /api/device-state
Get current device state for authenticated user's device.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200 OK):**
```json
{
  "deviceId": "ESP32_001",
  "temperature1": 25.5,
  "temperature2": 30.2,
  "temperature3": 22.8,
  "status": "online",
  "lastUpdate": "2024-01-01T12:00:00.000Z"
}
```

**Response when device is offline (200 OK):**
```json
{
  "deviceId": "ESP32_001",
  "temperature1": null,
  "temperature2": null,
  "temperature3": null,
  "status": "offline",
  "lastUpdate": null
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: Device state not found for user's device
- `500 Internal Server Error`: Server error

**Business Logic:**
- Status is calculated based on `last_update` timestamp
- Device is considered offline if `last_update` is older than 10 seconds (configurable)
- Temperature values can be `null` if sensor read failed (mapped from ESP32's `-999.0`)

---

### 2.3. Command Endpoints

#### POST /api/commands/power-on
Send power ON command to device.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{}
```

**Response (201 Created):**
```json
{
  "success": true,
  "command": {
    "id": 123,
    "deviceId": "ESP32_001",
    "commandType": "power_on",
    "commandValue": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "acknowledged": false
  },
  "message": "Command queued successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Device is offline (cannot send commands)
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User not authorized for this device
- `500 Internal Server Error`: Server error

**Business Logic:**
- Command is rejected if device status is `offline`
- Command is added to `pending_commands` table
- ESP32 will poll and execute the command
- Frontend should poll command status to check for ACK

---

#### POST /api/commands/power-off
Send power OFF command to device.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{}
```

**Response (201 Created):**
```json
{
  "success": true,
  "command": {
    "id": 124,
    "deviceId": "ESP32_001",
    "commandType": "power_off",
    "commandValue": null,
    "createdAt": "2024-01-01T12:00:01.000Z",
    "acknowledged": false
  },
  "message": "Command queued successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Device is offline (cannot send commands)
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User not authorized for this device
- `500 Internal Server Error`: Server error

---

#### POST /api/commands/servo
Send servo position command to device.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "value": 75.0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "command": {
    "id": 125,
    "deviceId": "ESP32_001",
    "commandType": "servo",
    "commandValue": 75.0,
    "createdAt": "2024-01-01T12:00:02.000Z",
    "acknowledged": false
  },
  "message": "Command queued successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid value (must be 0-100) or device is offline
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User not authorized for this device
- `500 Internal Server Error`: Server error

**Validation:**
- `value` must be a number between 0 and 100 (inclusive)

---

#### GET /api/commands/status/:commandId
Get command execution status (check for ACK).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Path Parameters:**
- `commandId` (integer, required): Command ID

**Response (200 OK) - Command acknowledged:**
```json
{
  "id": 125,
  "deviceId": "ESP32_001",
  "commandType": "servo",
  "commandValue": 75.0,
  "acknowledged": true,
  "acknowledgedAt": "2024-01-01T12:00:05.000Z",
  "createdAt": "2024-01-01T12:00:02.000Z"
}
```

**Response (200 OK) - Command pending:**
```json
{
  "id": 125,
  "deviceId": "ESP32_001",
  "commandType": "servo",
  "commandValue": 75.0,
  "acknowledged": false,
  "acknowledgedAt": null,
  "createdAt": "2024-01-01T12:00:02.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: User not authorized for this command
- `404 Not Found`: Command not found
- `500 Internal Server Error`: Server error

---

### 2.4. ESP32 Communication Endpoints

#### POST /api/esp32/data
ESP32 sends device state data (temperature readings).

**Request Body:**
```json
{
  "deviceId": "ESP32_001",
  "temperature1": 25.5,
  "temperature2": 30.2,
  "temperature3": 22.8,
  "sensorCount": 3
}
```

**Note:** Temperature values can be `-999.0` to indicate sensor read error (will be mapped to `null` in database).

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Data received"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data format or missing required fields
- `500 Internal Server Error`: Server error

**Business Logic:**
- Updates or inserts `device_state` record
- Sets `status` to `'online'`
- Sets `last_update` to current timestamp
- Maps `-999.0` temperature values to `null`
- Device is automatically registered in `devices` table if not exists

---

#### GET /api/esp32/commands
ESP32 polls for pending commands.

**Query Parameters:**
- `deviceId` (string, required): Device identifier

**Response (200 OK) - Commands available:**
```json
{
  "commands": [
    {
      "id": 125,
      "type": "servo",
      "value": 75.0
    },
    {
      "id": 124,
      "type": "power_off",
      "value": null
    }
  ]
}
```

**Response (200 OK) - No commands:**
```json
{
  "commands": []
}
```

**Error Responses:**
- `400 Bad Request`: Missing deviceId parameter
- `500 Internal Server Error`: Server error

**Business Logic:**
- Returns only unacknowledged commands for the device
- Commands are ordered by `created_at` ASC (FIFO)
- ESP32 should call this endpoint every 3 seconds

---

#### POST /api/esp32/commands/ack
ESP32 acknowledges command execution.

**Request Body:**
```json
{
  "deviceId": "ESP32_001",
  "commandId": 125,
  "status": "OK"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Command acknowledged"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Command not found
- `500 Internal Server Error`: Server error

**Business Logic:**
- Updates `pending_commands` record: sets `acknowledged = true`, `acknowledged_at = CURRENT_TIMESTAMP`
- Command can be cleaned up after acknowledgment (older than 1 minute)
- Frontend can poll command status to detect ACK

---

### 2.5. User Endpoints (Optional - for future use)

#### GET /api/users/me
Get current user profile (alias for `/api/auth/me`).

**Headers:**
- `Authorization: Bearer <token>` (required)

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "operator1",
  "deviceId": "ESP32_001",
  "createdAt": "2024-01-01T12:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `500 Internal Server Error`: Server error

---

### 2.6. Health Check Endpoints

#### GET /api/health
Health check endpoint for monitoring.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": "connected"
}
```

---

## 3. Authentication and Authorization

### 3.1. Authentication Mechanism

**Session-based Authentication:**
- Users authenticate via `POST /api/auth/login` with username and password
- Server creates a session record in `sessions` table with:
  - Unique token (UUID or random string)
  - Expiration time (e.g., 24 hours from creation)
  - User ID reference
- Token is returned to client and must be included in `Authorization: Bearer <token>` header for protected endpoints
- Token is validated on each request by checking:
  - Token exists in `sessions` table
  - Token is not expired (`expires_at > CURRENT_TIMESTAMP`)
  - Optionally: update `last_used_at` timestamp

**Alternative (for MVP):** Simple session token stored in database. JWT can be implemented later if needed.

### 3.2. Authorization Rules

**Public Endpoints (no authentication required):**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/esp32/data`
- `GET /api/esp32/commands`
- `POST /api/esp32/commands/ack`
- `GET /api/health`

**Protected Endpoints (authentication required):**
- All other endpoints require valid authentication token

**Authorization Logic:**
- Users can only access data and send commands for their own `deviceId`
- When user authenticates, their `deviceId` is retrieved from `users` table
- All queries filter by user's `deviceId`:
  - `GET /api/device-state` returns state for user's device only
  - Commands can only be sent to user's device
  - Command status can only be checked for user's device commands
- ESP32 endpoints are public but should validate `deviceId` exists in `devices` table

### 3.3. Session Management

**Session Expiration:**
- Sessions expire after configured time (e.g., 24 hours)
- Expired sessions are automatically rejected
- Frontend should handle `401 Unauthorized` responses and redirect to login

**Session Cleanup:**
- Expired sessions can be cleaned up periodically (cron job or scheduled task)
- Delete sessions where `expires_at < CURRENT_TIMESTAMP`

---

## 4. Validation and Business Logic

### 4.1. Input Validation

#### User Registration (`POST /api/auth/register`)
- `username`: Required, string, max 50 characters, unique (check against `users.username`)
- `password`: Required, string, minimum length TBD (suggest 8+ characters), should be hashed with bcrypt (min 10 rounds)
- `deviceId`: Required, string, max 100 characters, must exist in `devices` table or be auto-created

#### User Login (`POST /api/auth/login`)
- `username`: Required, string, non-empty
- `password`: Required, string, non-empty
- Password must match hashed password in database (bcrypt comparison)

#### Servo Command (`POST /api/commands/servo`)
- `value`: Required, number, must be between 0 and 100 (inclusive)
- Device must be online (status = 'online') to accept commands

#### ESP32 Data (`POST /api/esp32/data`)
- `deviceId`: Required, string, max 100 characters
- `temperature1`, `temperature2`, `temperature3`: Optional, number or `-999.0` (error value)
- `sensorCount`: Optional, integer
- Temperature values `-999.0` are mapped to `null` in database

#### ESP32 Command ACK (`POST /api/esp32/commands/ack`)
- `deviceId`: Required, string
- `commandId`: Required, integer, must exist in `pending_commands` table
- `status`: Required, string (expected "OK")

### 4.2. Business Logic

#### Device Status Calculation
- Device status (`online`/`offline`) is calculated based on `last_update` timestamp in `device_state` table
- **Rule**: If `last_update` is older than 10 seconds (configurable timeout), device is considered `offline`
- Status is updated:
  - To `online` when ESP32 sends data via `POST /api/esp32/data`
  - To `offline` when calculating status and timeout exceeded
- Frontend receives calculated status in `GET /api/device-state` response

#### Command Queue Management
- Commands are stored in `pending_commands` table with `acknowledged = false`
- ESP32 polls commands via `GET /api/esp32/commands` every 3 seconds
- Commands are returned in FIFO order (oldest first) by `created_at ASC`
- After ESP32 executes command, it sends ACK via `POST /api/esp32/commands/ack`
- ACK updates command: `acknowledged = true`, `acknowledged_at = CURRENT_TIMESTAMP`
- Commands are cleaned up after acknowledgment (older than 1 minute) or after timeout (e.g., 5 minutes if not acknowledged)

#### Command Rejection Rules
- Commands are rejected if device status is `offline` (returns `400 Bad Request`)
- Frontend should disable controls when device is offline
- Backend validates device status before queuing command

#### Temperature Error Handling
- ESP32 sends `-999.0` for sensor read errors
- Backend maps `-999.0` to `null` in database
- Frontend displays appropriate message for `null` temperatures (e.g., "Sensor Error")

#### Device Auto-Registration
- When ESP32 sends data with `deviceId` that doesn't exist in `devices` table, device is automatically created
- Device record is created with:
  - `device_id`: From ESP32 request
  - `name`: Optional, can be `null` or default to `device_id`
  - `created_at`: Current timestamp

#### User-Device Association
- Users are registered with a `deviceId` during registration
- Users can only access data and send commands for their associated device
- Authorization middleware checks user's `deviceId` against requested resource's `deviceId`

### 4.3. Database Constraints Validation

#### Users Table
- `username` UNIQUE constraint: Check before insert, return `409 Conflict` if duplicate
- `username` NOT NULL: Validated in application layer
- `password_hash` NOT NULL: Validated in application layer
- `device_id` NOT NULL: Validated in application layer

#### Device State Table
- `device_id` UNIQUE constraint: Use `INSERT ... ON CONFLICT DO UPDATE` (UPSERT)
- `status` CHECK constraint: Only 'online' or 'offline' values allowed
- Temperature columns can be `NULL` (sensor errors)

#### Pending Commands Table
- `command_type` CHECK constraint: Only 'power_on', 'power_off', 'servo' allowed
- `command_value` CHECK constraint: Must be NULL for power_on/power_off, must be 0-100 for servo
- `device_id` NOT NULL: Validated in application layer

#### Sessions Table
- `token` UNIQUE constraint: Generate unique token (UUID or cryptographically random string)
- `expires_at` NOT NULL: Set expiration time on creation
- `user_id` NOT NULL: Validated in application layer

### 4.4. Error Handling

**Standard Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": {} // Optional, additional error details
}
```

**HTTP Status Codes:**
- `200 OK`: Successful GET, PUT, PATCH requests
- `201 Created`: Successful POST requests creating new resources
- `400 Bad Request`: Validation errors, invalid input
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User not authorized for requested resource
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate username)
- `500 Internal Server Error`: Server errors

**Error Messages:**
- Use clear, user-friendly messages in Polish (per project requirements)
- Include relevant field names in validation errors
- Log detailed errors server-side for debugging

---

## 5. Additional Considerations

### 5.1. Polling Strategy

**Frontend Polling:**
- Frontend polls `GET /api/device-state` every 5 seconds (as per PRD)
- Frontend polls `GET /api/commands/status/:commandId` after sending command to check for ACK
- Polling should stop when device is offline to reduce unnecessary requests

**ESP32 Polling:**
- ESP32 polls `GET /api/esp32/commands` every 3 seconds
- ESP32 sends data via `POST /api/esp32/data` every 1 second

### 5.2. Rate Limiting (Future Enhancement)

Consider implementing rate limiting for:
- Authentication endpoints (prevent brute force)
- ESP32 endpoints (prevent abuse)
- Command endpoints (prevent command spam)

### 5.3. CORS Configuration

- Backend should allow CORS from frontend origin
- ESP32 endpoints may need specific CORS headers
- Configure in Express middleware

### 5.4. Logging

- Log all authentication attempts (success and failure)
- Log command creation and acknowledgment
- Log ESP32 data reception
- Log authorization failures
- Use structured logging for easier debugging

### 5.5. Database Indexes

Ensure indexes are created for:
- `users.username` (for login lookup)
- `sessions.token` (for token validation)
- `device_state.device_id` (for state lookup)
- `pending_commands.device_id, acknowledged` (for command polling)
- `pending_commands.created_at` (for FIFO ordering)

---

## 6. API Versioning

For MVP, versioning is not required. If needed in future:
- Use URL versioning: `/api/v1/...`
- Or header-based versioning: `API-Version: 1`

---

## 7. Assumptions and Decisions

### 7.1. Assumptions Made

1. **Password Policy**: Minimum length and complexity requirements are TBD. Assumed minimum 8 characters for MVP.
2. **Session Duration**: Assumed 24 hours. Can be configured.
3. **Device Offline Timeout**: Assumed 10 seconds. Can be configured.
4. **Command Cleanup**: Commands are cleaned up 1 minute after acknowledgment or 5 minutes if not acknowledged.
5. **Token Format**: Using simple session tokens (UUID or random string) stored in database. JWT can be implemented later.

### 7.2. Design Decisions

1. **Separate ESP32 Endpoints**: ESP32 uses dedicated endpoints (`/api/esp32/*`) to allow different authentication/authorization rules (public access for ESP32).
2. **Command Status Polling**: Frontend polls command status instead of WebSocket for MVP simplicity.
3. **Device Auto-Registration**: Devices are automatically created when ESP32 first sends data.
4. **Status Calculation**: Device status is calculated on-the-fly based on `last_update` timestamp rather than stored.
5. **Single Device Per User**: MVP assumes one user = one device. Schema supports multiple devices per user for future.

---

## 8. Migration from Current Implementation

The current `server.js` has basic endpoints that need to be migrated:

**Current → New Mapping:**
- `POST /api/esp32/data` → Keep, enhance with deviceId and multiple temperatures
- `GET /api/esp32/power` → Remove, replace with `GET /api/esp32/commands`
- `POST /api/power` → Replace with `POST /api/commands/servo` or power commands
- `GET /api/data` → Replace with `GET /api/device-state` (with authentication)
- `GET /api/power` → Remove, not needed

**New Endpoints to Add:**
- All authentication endpoints
- Command endpoints (power-on, power-off, servo)
- Command status endpoint
- ESP32 command polling and ACK endpoints
