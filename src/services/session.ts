import { authAPI } from './api'

export interface Session {
  id: string
  user_id: number
  device_info: string
  ip_address: string
  is_active: boolean
  expires_at: string
  created_at: string
  last_used_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  session_id: string
}

class SessionManager {
  private refreshPromise: Promise<string> | null = null
  private isRefreshing = false

  // Store tokens in localStorage
  private setTokens(tokens: AuthTokens) {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    localStorage.setItem('session_id', tokens.session_id)
  }

  // Get tokens from localStorage
  private getTokens(): AuthTokens | null {
    const access_token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    const session_id = localStorage.getItem('session_id')

    if (!access_token || !refresh_token || !session_id) {
      return null
    }

    return {
      access_token,
      refresh_token,
      session_id,
    }
  }

  // Clear tokens from localStorage
  private clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('session_id')
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const tokens = this.getTokens()
    return !!tokens?.access_token
  }

  // Get current access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  }

  // Get current refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  // Get current session ID
  getSessionId(): string | null {
    return localStorage.getItem('session_id')
  }

  // Set authentication tokens
  setAuthTokens(tokens: AuthTokens) {
    this.setTokens(tokens)
  }

  // Refresh access token
  async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()

    try {
      const newAccessToken = await this.refreshPromise
      return newAccessToken
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performRefresh(): Promise<string> {
    try {
      const refresh_token = this.getRefreshToken()
      if (!refresh_token) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refresh(refresh_token)
      const newAccessToken = response.data.access_token

      // Update stored access token
      localStorage.setItem('access_token', newAccessToken)

      return newAccessToken
    } catch (error) {
      // If refresh fails, clear all tokens and redirect to login
      this.clearTokens()
      window.location.href = '/login'
      throw error
    }
  }

  // Logout current session
  async logout(sessionId?: string): Promise<void> {
    try {
      const currentSessionId = sessionId || this.getSessionId()
      if (currentSessionId) {
        await authAPI.logout(currentSessionId)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
    }
  }

  // Logout from all devices
  async logoutAll(): Promise<void> {
    try {
      await authAPI.logoutAll()
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      this.clearTokens()
    }
  }

  // Get all active sessions
  async getSessions(): Promise<Session[]> {
    try {
      const response = await authAPI.getSessions()
      return response.data.sessions
    } catch (error) {
      console.error('Get sessions error:', error)
      return []
    }
  }

  // Revoke a specific session
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await authAPI.revokeSession(sessionId)
    } catch (error) {
      console.error('Revoke session error:', error)
      throw error
    }
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const accessToken = this.getAccessToken()
    if (!accessToken) return true

    try {
      // Decode JWT payload (without verification)
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convert to milliseconds
      const currentTime = Date.now()

      // Consider token expired if it expires within 5 minutes
      return currentTime >= expirationTime - 5 * 60 * 1000
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true
    }
  }

  // Auto-refresh token if needed
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
}

// Create singleton instance
export const sessionManager = new SessionManager()
