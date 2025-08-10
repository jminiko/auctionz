# Session Management System Guide

This document describes the comprehensive session management system implemented across the AuctionZ Vue.js application.

## Overview

The session management system provides:

- **Real-time session monitoring** with expiry warnings
- **Automatic token refresh** to maintain user sessions
- **Multi-device session management** with the ability to view and revoke sessions
- **Session-aware navigation** across all views
- **Automatic logout** when sessions expire
- **Session status indicators** throughout the application

## Architecture

### Core Components

1. **SessionManager Service** (`src/services/session.ts`)
   - Handles JWT token storage and refresh
   - Manages session state and expiry tracking
   - Provides session management API calls

2. **SessionAwareWrapper Component** (`src/components/SessionAwareWrapper.vue`)
   - Global wrapper that provides session context
   - Displays session status bar for authenticated users
   - Handles session expiry warnings and auto-logout

3. **SessionNavigation Component** (`src/components/SessionNavigation.vue`)
   - Compact session status display
   - Quick actions for session management
   - Session information modal

4. **Auth Store** (`src/stores/auth.ts`)
   - Integrates with SessionManager
   - Manages user authentication state
   - Handles login/logout operations

## Implementation Details

### Session Status Bar

The session status bar appears at the top of authenticated pages and shows:

- **Session Status**: Active, Expiring Soon, or Not Authenticated
- **Time Remaining**: Countdown to session expiry
- **Quick Actions**: Refresh session, View sessions, Logout

```vue
<template>
  <div class="session-status-bar">
    <div class="session-info">
      <span class="session-indicator" :class="{ 'session-expiring': isSessionExpiring }">
        {{ sessionStatusText }}
      </span>
      <span class="session-time" v-if="sessionTimeLeft">
        {{ sessionTimeLeft }}
      </span>
    </div>
    <div class="session-actions">
      <button @click="refreshSession" class="btn btn-sm btn-outline">Refresh</button>
      <button @click="showSessionModal = true" class="btn btn-sm btn-secondary">Sessions</button>
    </div>
  </div>
</template>
```

### Session Monitoring

The system continuously monitors session expiry:

```typescript
// Check session expiry every second
sessionCheckInterval.value = window.setInterval(checkSessionExpiry, 1000)

// Show warning 5 minutes before expiry
if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0 && !showExpiryWarning.value) {
  showExpiryWarning.value = true
}

// Auto logout when expired
if (timeLeft <= 0) {
  authStore.logout()
}
```

### Automatic Token Refresh

The SessionManager automatically refreshes tokens before they expire:

```typescript
async ensureValidToken(): Promise<string | null> {
  if (!this.isAuthenticated()) {
    return null
  }

  if (this.isTokenExpired()) {
    try {
      return await this.refreshAccessToken()
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  return this.getAccessToken()
}
```

## Integration Across Views

### Dashboard Views

All dashboard views now include session management:

1. **DashboardView** - Main dashboard with session navigation
2. **AdminDashboardView** - Admin dashboard with session status
3. **SellerDashboardView** - Seller dashboard with session monitoring
4. **BuyerDashboardView** - Buyer dashboard with session awareness

### Auction Views

Auction-related views include session management:

1. **AuctionListView** - Browse auctions with session status
2. **AuctionDetailView** - Individual auction with session monitoring
3. **MyAuctionsView** - Seller's auctions with session awareness
4. **CreateAuctionView** - Create auction with session validation

### Profile and Settings

User profile and settings include comprehensive session management:

1. **ProfileView** - User profile with session information
2. **SessionManager** - Dedicated session management page
3. **LogoutView** - Logout options with session controls

## Session Management Features

### 1. Session Status Display

- **Active**: Green indicator with session time remaining
- **Expiring Soon**: Yellow pulsing indicator with warning
- **Expired**: Automatic logout and redirect to login

### 2. Session Information Modal

Shows detailed session information:

- Current session details (device, IP, last active)
- All active sessions across devices
- Session expiry times
- Quick actions to revoke sessions

### 3. Multi-Device Management

Users can:

- View all active sessions
- Revoke specific sessions
- Logout from all devices
- See device information and IP addresses

### 4. Automatic Session Handling

- **Token Refresh**: Automatic refresh before expiry
- **Expiry Warnings**: 5-minute warning before session expires
- **Auto Logout**: Automatic logout when session expires
- **Session Cleanup**: Automatic cleanup of expired sessions

## API Integration

### Backend Endpoints

The session management system integrates with these Flask backend endpoints:

```python
# Session management endpoints
POST /auth/refresh          # Refresh access token
POST /auth/logout           # Logout current session
POST /auth/logout-all       # Logout all sessions
GET /auth/sessions          # Get all active sessions
DELETE /auth/sessions/<id>  # Revoke specific session
```

### Frontend API Service

The frontend uses the `sessionManager` service for all session operations:

```typescript
// Session management methods
await sessionManager.refreshAccessToken()
await sessionManager.logout()
await sessionManager.logoutAll()
await sessionManager.getSessions()
await sessionManager.revokeSession(sessionId)
```

## Security Features

### 1. Token Security

- **Access Tokens**: Short-lived (1 hour) for API requests
- **Refresh Tokens**: Long-lived (30 days) for session renewal
- **Secure Storage**: Tokens stored in localStorage with encryption
- **Automatic Cleanup**: Expired tokens automatically removed

### 2. Session Security

- **Device Tracking**: Track device information and IP addresses
- **Session Revocation**: Allow users to revoke suspicious sessions
- **Multi-Device Support**: Manage sessions across multiple devices
- **Automatic Expiry**: Sessions automatically expire for security

### 3. Authentication Guards

- **Route Protection**: Protected routes require valid sessions
- **Role-Based Access**: Different access levels based on user roles
- **Session Validation**: Automatic session validation on route changes
- **Redirect Handling**: Proper redirects for expired sessions

## Usage Examples

### Adding Session Management to a New View

1. **Import the SessionNavigation component**:

```vue
<script setup lang="ts">
import SessionNavigation from '@/components/SessionNavigation.vue'
</script>
```

2. **Add to template**:

```vue
<template>
  <div class="your-view">
    <!-- Session Navigation -->
    <SessionNavigation />

    <!-- Your view content -->
    <div class="content">
      <!-- ... -->
    </div>
  </div>
</template>
```

### Custom Session Handling

```typescript
// Check if session is valid
if (sessionManager.isAuthenticated()) {
  // Perform authenticated operations
}

// Refresh session manually
await sessionManager.refreshAccessToken()

// Get session information
const sessions = await sessionManager.getSessions()

// Revoke a specific session
await sessionManager.revokeSession(sessionId)
```

### Session-Aware API Calls

```typescript
// API calls automatically include session tokens
const response = await api.get('/protected-endpoint')

// If token expires, automatic refresh and retry
// If refresh fails, automatic logout and redirect
```

## Configuration

### Session Timeouts

Configure session timeouts in the backend:

```python
# config.py
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
```

### Frontend Configuration

Session management settings in the frontend:

```typescript
// Session expiry warning time (5 minutes)
const EXPIRY_WARNING_TIME = 5 * 60 * 1000

// Session check interval (1 second)
const SESSION_CHECK_INTERVAL = 1000

// Expiry warning check interval (30 seconds)
const EXPIRY_WARNING_INTERVAL = 30000
```

## Troubleshooting

### Common Issues

1. **Session Expires Unexpectedly**
   - Check token expiry times in backend configuration
   - Verify automatic refresh is working
   - Check network connectivity for API calls

2. **Multiple Sessions Not Showing**
   - Verify backend session tracking is enabled
   - Check session cleanup is not removing valid sessions
   - Ensure session API endpoints are working

3. **Session Refresh Fails**
   - Check refresh token is valid
   - Verify backend refresh endpoint is working
   - Check for network connectivity issues

### Debug Information

Enable debug logging for session management:

```typescript
// Enable session debug logging
localStorage.setItem('session_debug', 'true')

// Check session state
console.log('Session state:', {
  isAuthenticated: sessionManager.isAuthenticated(),
  accessToken: sessionManager.getAccessToken(),
  sessionId: sessionManager.getSessionId(),
  isExpired: sessionManager.isTokenExpired(),
})
```

## Best Practices

### 1. Session Security

- Always use HTTPS in production
- Implement proper token storage security
- Regular session cleanup and monitoring
- User education about session management

### 2. User Experience

- Clear session status indicators
- Proactive session expiry warnings
- Easy session management interface
- Graceful handling of session failures

### 3. Performance

- Efficient session checking intervals
- Minimal API calls for session validation
- Proper cleanup of expired sessions
- Optimized token refresh logic

## Future Enhancements

### Planned Features

1. **Session Analytics**
   - Track session usage patterns
   - Identify suspicious session activity
   - Session performance metrics

2. **Advanced Security**
   - Biometric authentication support
   - Device fingerprinting
   - Risk-based session management

3. **Enhanced UX**
   - Session activity timeline
   - Device management interface
   - Session sharing capabilities

4. **Integration Features**
   - SSO integration support
   - Third-party authentication
   - Multi-tenant session management

## Conclusion

The session management system provides a comprehensive, secure, and user-friendly approach to managing user sessions across the AuctionZ application. It ensures users have a seamless experience while maintaining security and providing transparency about their session status.

The system is designed to be:

- **Secure**: Multiple layers of security and automatic cleanup
- **User-Friendly**: Clear status indicators and easy management
- **Scalable**: Efficient handling of multiple sessions and devices
- **Maintainable**: Well-structured code with clear separation of concerns

This implementation serves as a solid foundation for session management that can be extended and enhanced as the application grows.
