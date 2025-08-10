# Session Management Implementation

This document describes the comprehensive session management system implemented for the AuctionZ application.

## Overview

The session management system provides secure, persistent user sessions with automatic token refresh, multi-device support, and comprehensive session tracking.

## Architecture

### Backend (Flask)

#### Session Model (`models/session.py`)

- **UserSession**: Database model for tracking user sessions
- **Session Tracking**: Device info, IP address, user agent
- **Expiration Management**: Automatic session expiration
- **Security Features**: Session validation and cleanup

#### Authentication Routes (`routes/auth.py`)

- **Enhanced Login/Register**: Creates access and refresh tokens
- **Token Refresh**: Automatic token refresh endpoint
- **Session Management**: Logout, session listing, session revocation
- **Multi-device Support**: Logout from all devices

#### Configuration (`config.py`)

- **JWT Settings**: Short access tokens (1 hour), long refresh tokens (30 days)
- **Security Headers**: Secure cookie settings
- **Token Locations**: Headers and cookies support

### Frontend (Vue.js)

#### Session Manager (`services/session.ts`)

- **Token Management**: Secure token storage and retrieval
- **Auto-refresh**: Automatic token refresh before expiration
- **Session Validation**: Token expiration checking
- **Error Handling**: Graceful session cleanup on errors

#### Auth Store (`stores/auth.ts`)

- **Session Integration**: Uses session manager for authentication
- **Enhanced Logout**: Session-aware logout functionality
- **Token Persistence**: Automatic token restoration on page reload

#### Session Manager Component (`components/SessionManager.vue`)

- **Session Display**: Shows all active sessions
- **Device Management**: Device-specific session control
- **Session Revocation**: Individual session termination
- **Multi-device Logout**: Logout from all devices

## Key Features

### 🔐 **Secure Authentication**

- **JWT Tokens**: Access tokens (1 hour) + refresh tokens (30 days)
- **Automatic Refresh**: Seamless token refresh before expiration
- **Session Validation**: Server-side session verification
- **Secure Storage**: HttpOnly cookies and localStorage

### 📱 **Multi-Device Support**

- **Session Tracking**: Device info, IP address, user agent
- **Device Management**: View and manage all active sessions
- **Selective Logout**: Logout from specific devices
- **Bulk Logout**: Logout from all devices simultaneously

### 🛡️ **Security Features**

- **Session Expiration**: Automatic session cleanup
- **Token Rotation**: Regular token refresh
- **Session Revocation**: Immediate session termination
- **Security Headers**: CSRF protection and secure cookies

### 🔄 **Automatic Token Management**

- **Preemptive Refresh**: Refresh tokens before expiration
- **Error Recovery**: Automatic logout on refresh failure
- **Request Interception**: Automatic token injection
- **Response Handling**: Automatic retry on 401 errors

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login with session creation
- `POST /api/auth/register` - Register with session creation
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout current session
- `POST /api/auth/logout-all` - Logout from all devices

### Session Management

- `GET /api/auth/sessions` - Get all active sessions
- `DELETE /api/auth/sessions/<id>` - Revoke specific session

## Usage Examples

### Frontend Session Management

```typescript
// Login with session creation
const user = await authStore.login(credentials)
// Automatically creates session and stores tokens

// Check authentication status
const isAuth = sessionManager.isAuthenticated()

// Get current session info
const sessionId = sessionManager.getSessionId()

// Logout current session
await authStore.logout()

// Logout from all devices
await authStore.logoutAll()

// Get all active sessions
const sessions = await sessionManager.getSessions()

// Revoke specific session
await sessionManager.revokeSession(sessionId)
```

### Backend Session Management

```python
# Create new session
session = UserSession.create_session(
    user_id=user.id,
    refresh_token=refresh_token,
    request=request
)

# Get user sessions
sessions = UserSession.get_user_sessions(user_id)

# Cleanup expired sessions
cleaned_count = UserSession.cleanup_expired_sessions()

# Deactivate session
session.deactivate()
```

## Session Lifecycle

### 1. **Login/Register**

- User provides credentials
- Server validates and creates session
- Access token (1 hour) + refresh token (30 days) generated
- Session stored in database with device info

### 2. **Active Session**

- Access token used for API requests
- Automatic token refresh before expiration
- Session activity tracked (last_used_at)

### 3. **Token Refresh**

- Client detects token expiration
- Refresh token sent to server
- New access token generated
- Session updated with new activity

### 4. **Logout**

- Session marked as inactive
- Tokens cleared from client
- User redirected to login

## Security Considerations

### Token Security

- **Short-lived Access Tokens**: 1-hour expiration
- **Long-lived Refresh Tokens**: 30-day expiration
- **Secure Storage**: HttpOnly cookies for refresh tokens
- **Token Rotation**: Regular refresh prevents token reuse

### Session Security

- **Device Tracking**: IP address and user agent logging
- **Session Validation**: Server-side session verification
- **Automatic Cleanup**: Expired session removal
- **Revocation Support**: Immediate session termination

### API Security

- **Authentication Required**: Protected endpoints
- **Role-based Access**: User role verification
- **CSRF Protection**: Secure cookie settings
- **Error Handling**: Secure error responses

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hour
JWT_REFRESH_TOKEN_EXPIRES=2592000  # 30 days

# Security Settings
SESSION_COOKIE_SECURE=true  # HTTPS only
JWT_COOKIE_CSRF_PROTECT=true  # CSRF protection
```

### Database Schema

```sql
CREATE TABLE user_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    device_info VARCHAR(200),
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Maintenance

### Session Cleanup

```bash
# Run session cleanup task
python tasks/session_cleanup.py

# Or schedule with cron
0 * * * * cd /path/to/app && python tasks/session_cleanup.py
```

### Database Maintenance

```sql
-- Clean up expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Clean up inactive sessions
DELETE FROM user_sessions WHERE is_active = FALSE;
```

## Troubleshooting

### Common Issues

1. **Token Refresh Fails**
   - Check refresh token validity
   - Verify session exists in database
   - Check token expiration

2. **Session Not Found**
   - Verify session ID in database
   - Check session expiration
   - Ensure session is active

3. **Multiple Sessions**
   - Check for duplicate login attempts
   - Verify session cleanup is running
   - Review session creation logic

### Debug Steps

1. **Check Session Status**

   ```python
   session = UserSession.get_active_session(user_id, refresh_token)
   print(f"Session active: {session.is_active}")
   print(f"Session expired: {session.is_expired()}")
   ```

2. **Verify Token Validity**

   ```typescript
   const isValid = sessionManager.isAuthenticated()
   const isExpired = sessionManager.isTokenExpired()
   ```

3. **Check Database**
   ```sql
   SELECT * FROM user_sessions WHERE user_id = ?;
   SELECT COUNT(*) FROM user_sessions WHERE is_active = TRUE;
   ```

## Future Enhancements

### Planned Features

- **Session Analytics**: Usage patterns and statistics
- **Device Fingerprinting**: Advanced device identification
- **Geolocation Tracking**: Location-based session management
- **Session Notifications**: New login notifications
- **Session Limits**: Maximum concurrent sessions per user

### Security Improvements

- **Biometric Authentication**: Fingerprint/face recognition
- **Risk-based Authentication**: Suspicious activity detection
- **Session Encryption**: Enhanced token encryption
- **Audit Logging**: Comprehensive session audit trail
