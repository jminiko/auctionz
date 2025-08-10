# Session Lifecycle Management Guide

This document describes the comprehensive session lifecycle management system implemented in the AuctionZ application, which provides automatic session validation, logout, and redirection for both guarded and unguarded pages.

## Overview

The session lifecycle management system ensures that user sessions are continuously monitored and validated throughout the application. It automatically handles session expiry, invalid sessions, and network errors by logging out users and redirecting them appropriately.

### Key Features

- **Automatic Session Validation**: Validates sessions on route changes, page focus, and at regular intervals
- **Unguarded Page Protection**: Automatically logs out users on unguarded pages if their session is invalid
- **Real-time Status Monitoring**: Provides visual indicators of session status and expiry warnings
- **Automatic Token Refresh**: Attempts to refresh expired tokens before logging out
- **Smart Redirection**: Preserves current route for post-login redirection
- **Multi-device Session Management**: Integrates with existing session management features

## Architecture

### Core Components

1. **SessionLifecycleManager** (`sessionLifecycle.ts`)
   - Main service class that handles all session lifecycle operations
   - Manages validation intervals, event listeners, and state
   - Provides configuration options for different behaviors

2. **SessionLifecycleStatus** (`SessionLifecycleStatus.vue`)
   - UI component that displays session status and provides controls
   - Shows real-time session information and expiry warnings
   - Allows manual session refresh and force logout

3. **Router Integration** (`router/index.ts`)
   - Enhanced navigation guards that validate sessions on every route change
   - Handles both guarded and unguarded pages
   - Integrates with the session lifecycle manager

4. **App Integration** (`App.vue`)
   - Initializes the session lifecycle manager on app startup
   - Displays session status in the header
   - Handles cleanup on app destruction

## Configuration

### SessionLifecycleConfig

```typescript
interface SessionLifecycleConfig {
  // Session validation settings
  validateOnRouteChange: boolean // Default: true
  validateOnPageFocus: boolean // Default: true
  validateOnInterval: boolean // Default: true
  validationInterval: number // Default: 5 minutes

  // Auto-logout settings
  autoLogoutOnExpiry: boolean // Default: true
  autoLogoutOnInvalidSession: boolean // Default: true
  autoLogoutOnNetworkError: boolean // Default: true

  // Redirection settings
  redirectToLoginOnLogout: boolean // Default: true
  redirectToHomeOnLogout: boolean // Default: false
  preserveCurrentRoute: boolean // Default: true

  // Warning settings
  showExpiryWarning: boolean // Default: true
  warningTimeBeforeExpiry: number // Default: 10 minutes

  // Debug settings
  enableDebugLogging: boolean // Default: false
}
```

### Default Configuration

```typescript
const defaultConfig: SessionLifecycleConfig = {
  validateOnRouteChange: true,
  validateOnPageFocus: true,
  validateOnInterval: true,
  validationInterval: 5 * 60 * 1000, // 5 minutes

  autoLogoutOnExpiry: true,
  autoLogoutOnInvalidSession: true,
  autoLogoutOnNetworkError: true,

  redirectToLoginOnLogout: true,
  redirectToHomeOnLogout: false,
  preserveCurrentRoute: true,

  showExpiryWarning: true,
  warningTimeBeforeExpiry: 10 * 60 * 1000, // 10 minutes

  enableDebugLogging: false,
}
```

## Session Validation Process

### 1. Authentication Check

- Verifies if the user is authenticated using the auth store
- Returns early if not authenticated

### 2. Token Validation

- Checks if access token, refresh token, and session ID exist
- Validates token expiration using JWT payload
- Attempts token refresh if expired

### 3. Server Validation

- Fetches current sessions from the server
- Validates that the current session exists and is active
- Updates session state and expiry information

### 4. Expiry Monitoring

- Calculates time until session expiry
- Sets warning flags for expiring sessions
- Triggers automatic logout for expired sessions

## Session States

### Active Session

- User is authenticated
- Tokens are valid
- Session is active on server
- No expiry warnings

### Expiring Session

- Session will expire within warning time (default: 10 minutes)
- Visual warning indicators are shown
- User can extend session manually

### Expired Session

- Session has passed expiry time
- Automatic logout is triggered
- User is redirected to login page

### Invalid Session

- Session not found on server
- Session marked as inactive
- Missing or corrupted tokens
- Network errors during validation

## Event-Driven Validation

### Route Change Validation

```typescript
// Triggered on every navigation
router.beforeEach(async (to, from, next) => {
  if (authStore.isAuthenticated) {
    const validationResult = await sessionLifecycleManager.validateSession()
    if (!validationResult.isValid) {
      return // Let lifecycle manager handle logout/redirect
    }
  }
  next()
})
```

### Page Focus Validation

```typescript
// Triggered when page gains focus
window.addEventListener('focus', () => {
  sessionLifecycleManager.validateSession()
})
```

### Visibility Change Validation

```typescript
// Triggered when page becomes visible
window.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    sessionLifecycleManager.validateSession()
  }
})
```

### Interval Validation

```typescript
// Triggered at regular intervals
setInterval(() => {
  sessionLifecycleManager.validateSession()
}, validationInterval)
```

## Unguarded Page Protection

### Implementation

The system validates sessions on **all routes**, including unguarded ones:

```typescript
// Validate session for all routes (including unguarded ones)
if (authStore.isAuthenticated) {
  try {
    const validationResult = await sessionLifecycleManager.validateSession()

    if (!validationResult.isValid) {
      console.log('Session validation failed:', validationResult.reason)
      // The session lifecycle manager will handle logout and redirection
      return // Don't call next() - let the lifecycle manager handle it
    }
  } catch (error) {
    console.error('Session validation error:', error)
    // Continue with navigation even if validation fails
  }
}
```

### Behavior

1. **Valid Session**: User continues to the requested page
2. **Invalid Session**: User is automatically logged out and redirected to login
3. **Network Error**: Configurable behavior (default: logout or continue)

### Use Cases

- **Public Pages**: Home, About, Contact pages still validate sessions
- **Marketing Pages**: Landing pages check session validity
- **Error Pages**: 404 pages validate sessions
- **Redirect Pages**: Intermediate pages validate sessions

## UI Components

### SessionLifecycleStatus Component

Displays real-time session information and provides user controls:

```vue
<template>
  <div class="session-lifecycle-status">
    <!-- Status Indicator -->
    <div class="status-indicator">
      <div class="status-dot" :class="statusClass"></div>
      <span class="status-text">{{ statusText }}</span>
      <span class="time-left">{{ timeLeft }}</span>
    </div>

    <!-- Session Controls -->
    <div class="session-controls">
      <button @click="refreshSession" class="control-btn">🔄</button>
      <button @click="showSessionInfo = true" class="control-btn">ℹ️</button>
      <button @click="forceLogout" class="control-btn">🚪</button>
    </div>
  </div>
</template>
```

### Status Indicators

- **Active**: Green dot, "Active" status
- **Expiring**: Yellow pulsing dot, "Expiring Soon" status
- **Expired**: Red dot, "Expired" status
- **Validating**: Blue spinning dot, "Validating" status

### Session Information Modal

Provides detailed session information:

- User details (name, role)
- Session ID and device information
- Creation and last active times
- Expiry time with visual indicators
- Last validation time

## Integration with Existing Systems

### Auth Store Integration

```typescript
// Uses existing auth store for authentication state
const authStore = useAuthStore()

// Integrates with existing logout functionality
await sessionManager.logout()
this.authStore.logout()
```

### Session Manager Integration

```typescript
// Uses existing session manager for token operations
import { sessionManager } from './session'

// Leverages existing token refresh logic
await sessionManager.refreshAccessToken()
```

### Router Guard Integration

```typescript
// Enhances existing navigation guards
router.beforeEach(async (to, from, next) => {
  // Existing authentication checks
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // New session validation
  if (authStore.isAuthenticated) {
    const validationResult = await sessionLifecycleManager.validateSession()
    if (!validationResult.isValid) {
      return // Let lifecycle manager handle it
    }
  }

  next()
})
```

## Error Handling

### Network Errors

```typescript
try {
  const sessions = await sessionManager.getSessions()
  // Process sessions
} catch (error) {
  if (this.config.autoLogoutOnNetworkError) {
    await this.handleInvalidSession('Network error during validation')
  }
  return { isValid: false, reason: 'Network error' }
}
```

### Token Refresh Errors

```typescript
try {
  await sessionManager.refreshAccessToken()
} catch (error) {
  await this.handleInvalidSession('Token refresh failed')
  return { isValid: false, isExpired: true, reason: 'Token refresh failed' }
}
```

### Validation Errors

```typescript
try {
  // Validation logic
} catch (error) {
  console.error('Session validation error:', error)
  return { isValid: false, isInvalid: true, reason: 'Validation error' }
}
```

## Security Features

### Automatic Cleanup

- Clears all tokens on logout
- Removes event listeners on destruction
- Resets session state

### Token Validation

- Validates JWT token expiration
- Checks token integrity
- Verifies session existence on server

### Session Invalidation

- Handles server-side session revocation
- Responds to session deactivation
- Manages multi-device session conflicts

### Secure Redirection

- Preserves current route for post-login return
- Handles redirect loops
- Validates redirect URLs

## Performance Considerations

### Efficient Validation

- Prevents multiple simultaneous validations
- Uses debounced validation for rapid events
- Caches validation results

### Minimal Network Requests

- Batches session information requests
- Uses existing token refresh mechanisms
- Implements smart retry logic

### Memory Management

- Clears intervals on component destruction
- Removes event listeners properly
- Resets reactive state

## Debugging and Monitoring

### Debug Logging

```typescript
// Enable debug logging
sessionLifecycleManager.updateConfig({
  enableDebugLogging: true,
})
```

### Session State Monitoring

```typescript
// Get current session state
const state = sessionLifecycleManager.getSessionState()
console.log('Session State:', state)
```

### Validation Result Tracking

```typescript
// Monitor validation results
const result = await sessionLifecycleManager.validateSession()
console.log('Validation Result:', result)
```

## Testing

### Unit Tests

```typescript
// Test session validation
describe('SessionLifecycleManager', () => {
  it('should validate active sessions', async () => {
    const result = await sessionLifecycleManager.validateSession()
    expect(result.isValid).toBe(true)
  })

  it('should handle expired sessions', async () => {
    // Mock expired session
    const result = await sessionLifecycleManager.validateSession()
    expect(result.isExpired).toBe(true)
  })
})
```

### Integration Tests

```typescript
// Test router integration
describe('Router Integration', () => {
  it('should validate sessions on route change', async () => {
    // Navigate to unguarded route
    await router.push('/')
    // Verify session validation was called
  })
})
```

### E2E Tests

```typescript
// Test complete user flow
describe('Session Lifecycle E2E', () => {
  it('should logout user on invalid session', async () => {
    // Login user
    // Invalidate session on server
    // Navigate to unguarded page
    // Verify logout and redirect
  })
})
```

## Best Practices

### Configuration

- **Development**: Enable debug logging for troubleshooting
- **Production**: Disable debug logging for performance
- **Testing**: Use shorter intervals for faster feedback

### Error Handling

- **Graceful Degradation**: Continue operation on non-critical errors
- **User Feedback**: Provide clear error messages
- **Recovery**: Allow manual session refresh

### Security

- **Token Security**: Never expose tokens in logs
- **Session Validation**: Always validate with server
- **Secure Logout**: Clear all session data

### Performance

- **Efficient Validation**: Avoid unnecessary network requests
- **Smart Intervals**: Use appropriate validation frequencies
- **Memory Management**: Clean up resources properly

## Troubleshooting

### Common Issues

1. **Session Validation Fails**
   - Check network connectivity
   - Verify server session endpoints
   - Review token expiration settings

2. **Infinite Redirect Loops**
   - Check redirect configuration
   - Verify login page accessibility
   - Review navigation guard logic

3. **Performance Issues**
   - Reduce validation frequency
   - Optimize network requests
   - Review event listener cleanup

4. **UI Not Updating**
   - Check reactive state management
   - Verify component lifecycle
   - Review Vue reactivity system

### Debug Steps

1. **Enable Debug Logging**

   ```typescript
   sessionLifecycleManager.updateConfig({
     enableDebugLogging: true,
   })
   ```

2. **Check Session State**

   ```typescript
   console.log(sessionLifecycleManager.getSessionState())
   ```

3. **Monitor Network Requests**
   - Check browser network tab
   - Verify API endpoints
   - Review response data

4. **Validate Configuration**
   ```typescript
   console.log(sessionLifecycleManager.getSessionState().config)
   ```

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Session duration tracking
   - Validation success rates
   - User behavior patterns

2. **Enhanced Security**
   - Biometric authentication
   - Device fingerprinting
   - Risk-based validation

3. **Performance Optimization**
   - Background validation
   - Smart caching
   - Predictive expiry

4. **User Experience**
   - Customizable warnings
   - Session extension options
   - Multi-tab synchronization

### Configuration Extensions

```typescript
interface AdvancedSessionLifecycleConfig extends SessionLifecycleConfig {
  // Analytics
  enableAnalytics: boolean
  analyticsEndpoint: string

  // Security
  enableBiometrics: boolean
  deviceFingerprinting: boolean

  // Performance
  backgroundValidation: boolean
  smartCaching: boolean

  // UX
  customizableWarnings: boolean
  sessionExtensionOptions: boolean
}
```

## Conclusion

The session lifecycle management system provides a robust, secure, and user-friendly approach to session management across the entire application. By automatically validating sessions on all pages (including unguarded ones), it ensures that users are always in a valid session state and provides appropriate feedback and actions when sessions become invalid.

The system is designed to be:

- **Secure**: Multiple layers of validation and automatic cleanup
- **User-Friendly**: Clear status indicators and warning systems
- **Performant**: Efficient validation and minimal resource usage
- **Maintainable**: Clean architecture and comprehensive documentation
- **Extensible**: Ready for future enhancements and customizations

This implementation serves as a solid foundation for session management that can be extended and enhanced as the application grows and security requirements evolve.
