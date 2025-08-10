import { sessionManager } from './session'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export interface LogoutOptions {
  redirectTo?: string
  showConfirmation?: boolean
  clearAllData?: boolean
  reason?: string
}

export interface LogoutResult {
  success: boolean
  message: string
  redirected: boolean
}

class LogoutService {
  private authStore = useAuthStore()
  private router = useRouter()

  /**
   * Logout current session
   */
  async logoutCurrentSession(options: LogoutOptions = {}): Promise<LogoutResult> {
    try {
      // Show confirmation if requested
      if (options.showConfirmation) {
        const confirmed = await this.showLogoutConfirmation()
        if (!confirmed) {
          return {
            success: false,
            message: 'Logout cancelled',
            redirected: false,
          }
        }
      }

      // Log the logout reason
      if (options.reason) {
        console.log(`Logout reason: ${options.reason}`)
      }

      // Clear all data if requested
      if (options.clearAllData) {
        await this.clearAllApplicationData()
      }

      // Perform logout
      await this.authStore.logout()

      // Redirect user
      const redirectPath = options.redirectTo || '/login'
      await this.router.push(redirectPath)

      return {
        success: true,
        message: 'Logged out successfully',
        redirected: true,
      }
    } catch (error) {
      console.error('Logout error:', error)

      // Force logout even if API call fails
      this.authStore.user = null
      this.authStore.token = null
      sessionManager.clearTokens()

      await this.router.push('/login')

      return {
        success: false,
        message: 'Logout completed with errors',
        redirected: true,
      }
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(options: LogoutOptions = {}): Promise<LogoutResult> {
    try {
      // Show confirmation for logout all
      if (options.showConfirmation !== false) {
        const confirmed = await this.showLogoutAllConfirmation()
        if (!confirmed) {
          return {
            success: false,
            message: 'Logout cancelled',
            redirected: false,
          }
        }
      }

      // Log the logout reason
      if (options.reason) {
        console.log(`Logout all reason: ${options.reason}`)
      }

      // Clear all data
      await this.clearAllApplicationData()

      // Perform logout all
      await this.authStore.logoutAll()

      // Redirect user
      const redirectPath = options.redirectTo || '/login'
      await this.router.push(redirectPath)

      return {
        success: true,
        message: 'Logged out from all devices successfully',
        redirected: true,
      }
    } catch (error) {
      console.error('Logout all error:', error)

      // Force logout even if API call fails
      this.authStore.user = null
      this.authStore.token = null
      sessionManager.clearTokens()

      await this.router.push('/login')

      return {
        success: false,
        message: 'Logout from all devices completed with errors',
        redirected: true,
      }
    }
  }

  /**
   * Logout specific session
   */
  async logoutSpecificSession(
    sessionId: string,
    options: LogoutOptions = {},
  ): Promise<LogoutResult> {
    try {
      // Show confirmation
      if (options.showConfirmation !== false) {
        const confirmed = await this.showSessionLogoutConfirmation()
        if (!confirmed) {
          return {
            success: false,
            message: 'Session logout cancelled',
            redirected: false,
          }
        }
      }

      // Revoke specific session
      await sessionManager.revokeSession(sessionId)

      // Check if this was the current session
      const currentSessionId = sessionManager.getSessionId()
      if (sessionId === currentSessionId) {
        // This was the current session, perform full logout
        return await this.logoutCurrentSession(options)
      }

      return {
        success: true,
        message: 'Session revoked successfully',
        redirected: false,
      }
    } catch (error) {
      console.error('Session logout error:', error)
      return {
        success: false,
        message: 'Failed to revoke session',
        redirected: false,
      }
    }
  }

  /**
   * Force logout (emergency logout)
   */
  async forceLogout(reason?: string): Promise<LogoutResult> {
    try {
      console.warn(`Force logout triggered: ${reason || 'No reason provided'}`)

      // Clear all data immediately
      await this.clearAllApplicationData()

      // Force logout without API call
      this.authStore.user = null
      this.authStore.token = null
      sessionManager.clearTokens()

      // Redirect to login
      await this.router.push('/login')

      return {
        success: true,
        message: 'Force logout completed',
        redirected: true,
      }
    } catch (error) {
      console.error('Force logout error:', error)

      // Even if redirect fails, clear everything
      this.authStore.user = null
      this.authStore.token = null
      sessionManager.clearTokens()

      // Try to redirect again
      try {
        await this.router.push('/login')
      } catch (redirectError) {
        console.error('Redirect error:', redirectError)
        window.location.href = '/login'
      }

      return {
        success: true,
        message: 'Force logout completed with errors',
        redirected: true,
      }
    }
  }

  /**
   * Clear all application data
   */
  private async clearAllApplicationData(): Promise<void> {
    // Clear localStorage
    localStorage.clear()

    // Clear sessionStorage
    sessionStorage.clear()

    // Clear any cached data
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((name) => caches.delete(name)))
      } catch (error) {
        console.warn('Failed to clear caches:', error)
      }
    }

    // Clear any service worker registrations
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(registrations.map((registration) => registration.unregister()))
      } catch (error) {
        console.warn('Failed to unregister service workers:', error)
      }
    }
  }

  /**
   * Show logout confirmation dialog
   */
  private async showLogoutConfirmation(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm('Are you sure you want to logout?')
      resolve(confirmed)
    })
  }

  /**
   * Show logout all confirmation dialog
   */
  private async showLogoutAllConfirmation(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm(
        'Are you sure you want to logout from all devices? ' +
          'This will end your session on all devices including mobile apps.',
      )
      resolve(confirmed)
    })
  }

  /**
   * Show session logout confirmation dialog
   */
  private async showSessionLogoutConfirmation(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = confirm('Are you sure you want to end this session?')
      resolve(confirmed)
    })
  }

  /**
   * Check if user is currently logged in
   */
  isLoggedIn(): boolean {
    return this.authStore.isAuthenticated
  }

  /**
   * Get current user info
   */
  getCurrentUser() {
    return this.authStore.user
  }

  /**
   * Get current session info
   */
  getCurrentSession() {
    return {
      sessionId: sessionManager.getSessionId(),
      accessToken: sessionManager.getAccessToken(),
      isAuthenticated: sessionManager.isAuthenticated(),
    }
  }
}

// Create singleton instance
export const logoutService = new LogoutService()
