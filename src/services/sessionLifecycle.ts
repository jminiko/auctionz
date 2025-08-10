import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sessionManager, type Session } from './session'

export interface SessionLifecycleConfig {
  // Session validation settings
  validateOnRouteChange: boolean
  validateOnPageFocus: boolean
  validateOnInterval: boolean
  validationInterval: number // milliseconds

  // Auto-logout settings
  autoLogoutOnExpiry: boolean
  autoLogoutOnInvalidSession: boolean
  autoLogoutOnNetworkError: boolean

  // Redirection settings
  redirectToLoginOnLogout: boolean
  redirectToHomeOnLogout: boolean
  preserveCurrentRoute: boolean

  // Warning settings
  showExpiryWarning: boolean
  warningTimeBeforeExpiry: number // milliseconds

  // Debug settings
  enableDebugLogging: boolean
}

export interface SessionValidationResult {
  isValid: boolean
  isExpired: boolean
  isInvalid: boolean
  reason?: string
  session?: Session
}

class SessionLifecycleManager {
  private config: SessionLifecycleConfig
  private router: any = null
  private authStore: any = null

  // Reactive state
  private isInitialized = ref(false)
  private isValidationInProgress = ref(false)
  private lastValidationTime = ref<Date | null>(null)
  private validationIntervalId = ref<number | null>(null)
  private focusListenerId = ref<number | null>(null)
  private visibilityChangeListenerId = ref<number | null>(null)

  // Session state
  private currentSession = ref<Session | null>(null)
  private sessionExpiryTime = ref<Date | null>(null)
  private isSessionExpiring = ref(false)
  private isSessionExpired = ref(false)

  constructor(config: Partial<SessionLifecycleConfig> = {}) {
    this.config = {
      // Default configuration
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
      ...config,
    }
  }

    // Initialize the session lifecycle manager
  async initialize(router?: any, authStore?: any): Promise<void> {
    if (this.isInitialized.value) {
      this.log('Session lifecycle manager already initialized')
      return
    }

    this.log('Initializing session lifecycle manager')
    
    try {
      // Set router and auth store if provided
      if (router) this.router = router
      if (authStore) this.authStore = authStore
      
      // Set up event listeners
      this.setupEventListeners()
      
      // Perform initial validation
      await this.validateSession()
      
      // Start validation interval
      if (this.config.validateOnInterval) {
        this.startValidationInterval()
      }
      
      this.isInitialized.value = true
      this.log('Session lifecycle manager initialized successfully')
    } catch (error) {
      this.log('Failed to initialize session lifecycle manager:', error)
      throw error
    }
  }

  // Clean up the session lifecycle manager
  destroy(): void {
    this.log('Destroying session lifecycle manager')

    // Clear intervals
    if (this.validationIntervalId.value) {
      clearInterval(this.validationIntervalId.value)
      this.validationIntervalId.value = null
    }

    // Remove event listeners
    this.removeEventListeners()

    // Reset state
    this.isInitialized.value = false
    this.isValidationInProgress.value = false
    this.currentSession.value = null
    this.sessionExpiryTime.value = null
    this.isSessionExpiring.value = false
    this.isSessionExpired.value = false

    this.log('Session lifecycle manager destroyed')
  }

  // Validate current session
  async validateSession(): Promise<SessionValidationResult> {
    if (this.isValidationInProgress.value) {
      this.log('Session validation already in progress')
      return { isValid: false, isExpired: false, isInvalid: true, reason: 'Validation in progress' }
    }

    this.isValidationInProgress.value = true
    this.lastValidationTime.value = new Date()

    try {
      this.log('Starting session validation')

      // Check if auth store is available
      if (!this.authStore) {
        this.log('Auth store not available')
        return { isValid: false, isExpired: false, isInvalid: true, reason: 'Auth store not available' }
      }

      // Check if user is authenticated
      if (!this.authStore.isAuthenticated) {
        this.log('User not authenticated')
        return { isValid: false, isExpired: false, isInvalid: true, reason: 'Not authenticated' }
      }

      // Check if tokens exist
      const accessToken = sessionManager.getAccessToken()
      const refreshToken = sessionManager.getRefreshToken()
      const sessionId = sessionManager.getSessionId()

      if (!accessToken || !refreshToken || !sessionId) {
        this.log('Missing authentication tokens')
        await this.handleInvalidSession('Missing authentication tokens')
        return { isValid: false, isExpired: false, isInvalid: true, reason: 'Missing tokens' }
      }

      // Check if token is expired
      if (sessionManager.isTokenExpired()) {
        this.log('Access token expired, attempting refresh')
        try {
          await sessionManager.refreshAccessToken()
          this.log('Token refreshed successfully')
        } catch (error) {
          this.log('Token refresh failed:', error)
          await this.handleInvalidSession('Token refresh failed')
          return {
            isValid: false,
            isExpired: true,
            isInvalid: false,
            reason: 'Token refresh failed',
          }
        }
      }

      // Validate session with server
      try {
        const sessions = await sessionManager.getSessions()
        const currentSession = sessions.find((s) => s.id === sessionId)

        if (!currentSession) {
          this.log('Current session not found on server')
          await this.handleInvalidSession('Session not found on server')
          return { isValid: false, isExpired: false, isInvalid: true, reason: 'Session not found' }
        }

        if (!currentSession.is_active) {
          this.log('Current session is inactive')
          await this.handleInvalidSession('Session inactive')
          return { isValid: false, isExpired: false, isInvalid: true, reason: 'Session inactive' }
        }

        // Update session state
        this.currentSession.value = currentSession
        this.sessionExpiryTime.value = new Date(currentSession.expires_at)

        // Check if session is expiring soon
        const timeUntilExpiry = this.sessionExpiryTime.value.getTime() - Date.now()
        this.isSessionExpiring.value =
          timeUntilExpiry <= this.config.warningTimeBeforeExpiry && timeUntilExpiry > 0
        this.isSessionExpired.value = timeUntilExpiry <= 0

        if (this.isSessionExpired.value) {
          this.log('Session has expired')
          await this.handleInvalidSession('Session expired')
          return { isValid: false, isExpired: true, isInvalid: false, reason: 'Session expired' }
        }

        this.log('Session validation successful')
        return {
          isValid: true,
          isExpired: false,
          isInvalid: false,
          session: currentSession,
        }
      } catch (error) {
        this.log('Server validation failed:', error)
        if (this.config.autoLogoutOnNetworkError) {
          await this.handleInvalidSession('Network error during validation')
        }
        return { isValid: false, isExpired: false, isInvalid: true, reason: 'Network error' }
      }
    } catch (error) {
      this.log('Session validation error:', error)
      return { isValid: false, isExpired: false, isInvalid: true, reason: 'Validation error' }
    } finally {
      this.isValidationInProgress.value = false
    }
  }

    // Handle invalid session
  private async handleInvalidSession(reason: string): Promise<void> {
    this.log('Handling invalid session:', reason)
    
    try {
      // Clear session data
      await sessionManager.logout()
      if (this.authStore) {
        this.authStore.logout()
      }
      
      // Update state
      this.currentSession.value = null
      this.sessionExpiryTime.value = null
      this.isSessionExpiring.value = false
      this.isSessionExpired.value = true
      
      // Redirect user
      await this.redirectAfterLogout()
    } catch (error) {
      this.log('Error handling invalid session:', error)
    }
  }

    // Redirect user after logout
  private async redirectAfterLogout(): Promise<void> {
    if (!this.router) {
      this.log('Router not available, using window.location')
      window.location.href = '/login'
      return
    }
    
    const currentRoute = this.router.currentRoute.value
    
    // Determine redirect destination
    let redirectPath = '/login'
    
    if (this.config.redirectToHomeOnLogout) {
      redirectPath = '/'
    } else if (this.config.preserveCurrentRoute && currentRoute.path !== '/') {
      // Add current route as redirect parameter
      redirectPath = `/login?redirect=${encodeURIComponent(currentRoute.fullPath)}`
    }
    
    this.log('Redirecting after logout to:', redirectPath)
    
    try {
      await this.router.push(redirectPath)
    } catch (error) {
      this.log('Error redirecting after logout:', error)
      // Fallback to window.location
      window.location.href = redirectPath
    }
  }

  // Set up event listeners
  private setupEventListeners(): void {
    // Page focus event
    if (this.config.validateOnPageFocus) {
      this.focusListenerId.value = window.addEventListener('focus', () => {
        this.log('Page focused, validating session')
        this.validateSession()
      }) as any
    }

    // Page visibility change event
    this.visibilityChangeListenerId.value = window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.log('Page became visible, validating session')
        this.validateSession()
      }
    }) as any

    // Before unload event
    window.addEventListener('beforeunload', () => {
      this.log('Page unloading, cleaning up session lifecycle')
      this.destroy()
    })
  }

  // Remove event listeners
  private removeEventListeners(): void {
    if (this.focusListenerId.value) {
      window.removeEventListener('focus', this.validateSession)
      this.focusListenerId.value = null
    }

    if (this.visibilityChangeListenerId.value) {
      window.removeEventListener('visibilitychange', this.validateSession)
      this.visibilityChangeListenerId.value = null
    }
  }

  // Start validation interval
  private startValidationInterval(): void {
    if (this.validationIntervalId.value) {
      clearInterval(this.validationIntervalId.value)
    }

    this.validationIntervalId.value = window.setInterval(() => {
      this.log('Validation interval triggered')
      this.validateSession()
    }, this.config.validationInterval)

    this.log('Started validation interval:', this.config.validationInterval)
  }

  // Stop validation interval
  private stopValidationInterval(): void {
    if (this.validationIntervalId.value) {
      clearInterval(this.validationIntervalId.value)
      this.validationIntervalId.value = null
      this.log('Stopped validation interval')
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<SessionLifecycleConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.log('Configuration updated:', this.config)

    // Restart interval if needed
    if (this.config.validateOnInterval) {
      this.startValidationInterval()
    } else {
      this.stopValidationInterval()
    }
  }

  // Get current session state
  getSessionState() {
    return {
      isInitialized: this.isInitialized.value,
      isValidationInProgress: this.isValidationInProgress.value,
      lastValidationTime: this.lastValidationTime.value,
      currentSession: this.currentSession.value,
      sessionExpiryTime: this.sessionExpiryTime.value,
      isSessionExpiring: this.isSessionExpiring.value,
      isSessionExpired: this.isSessionExpired.value,
      config: this.config,
    }
  }

  // Force logout
  async forceLogout(reason: string = 'Manual logout'): Promise<void> {
    this.log('Force logout triggered:', reason)
    await this.handleInvalidSession(reason)
  }

  // Manual session refresh
  async refreshSession(): Promise<boolean> {
    this.log('Manual session refresh requested')
    const result = await this.validateSession()
    return result.isValid
  }

  // Debug logging
  private log(...args: any[]): void {
    if (this.config.enableDebugLogging) {
      console.log('[SessionLifecycle]', ...args)
    }
  }
}

// Create singleton instance
export const sessionLifecycleManager = new SessionLifecycleManager()

// Export reactive state for components
export const useSessionLifecycle = () => {
  return {
    // State
    isInitialized: computed(() => sessionLifecycleManager.getSessionState().isInitialized),
    isValidationInProgress: computed(
      () => sessionLifecycleManager.getSessionState().isValidationInProgress,
    ),
    lastValidationTime: computed(
      () => sessionLifecycleManager.getSessionState().lastValidationTime,
    ),
    currentSession: computed(() => sessionLifecycleManager.getSessionState().currentSession),
    sessionExpiryTime: computed(() => sessionLifecycleManager.getSessionState().sessionExpiryTime),
    isSessionExpiring: computed(() => sessionLifecycleManager.getSessionState().isSessionExpiring),
    isSessionExpired: computed(() => sessionLifecycleManager.getSessionState().isSessionExpired),

    // Methods
    initialize: (router?: any, authStore?: any) => sessionLifecycleManager.initialize(router, authStore),
    destroy: () => sessionLifecycleManager.destroy(),
    validateSession: () => sessionLifecycleManager.validateSession(),
    forceLogout: (reason?: string) => sessionLifecycleManager.forceLogout(reason),
    refreshSession: () => sessionLifecycleManager.refreshSession(),
    updateConfig: (config: Partial<SessionLifecycleConfig>) =>
      sessionLifecycleManager.updateConfig(config),
    getSessionState: () => sessionLifecycleManager.getSessionState(),
  }
}
