import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'
import { sessionManager, type AuthTokens } from '@/services/session'

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'buyer' | 'seller' | 'admin'
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  email_verified: boolean
  phone_verified: boolean
  notification_email: boolean
  notification_sms: boolean
  notification_push: boolean
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
  updated_at: string
  last_login?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'buyer' | 'seller'
  phone?: string
  location?: string
  bio?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(sessionManager.getAccessToken())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isSeller = computed(() => user.value?.role === 'seller')
  const isBuyer = computed(() => user.value?.role === 'buyer')

  // Real API functions
  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.login(credentials)
      const { user: userData, access_token, refresh_token, session_id } = response.data

      user.value = userData
      token.value = access_token

      // Store tokens using session manager
      sessionManager.setAuthTokens({
        access_token,
        refresh_token,
        session_id,
      })

      return userData
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed. Please check your credentials.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterData) => {
    loading.value = true
    error.value = null

    try {
      const response = await authAPI.register(userData)
      const { user: newUser, access_token, refresh_token, session_id } = response.data

      user.value = newUser
      token.value = access_token

      // Store tokens using session manager
      sessionManager.setAuthTokens({
        access_token,
        refresh_token,
        session_id,
      })

      return newUser
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Registration failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async (sessionId?: string) => {
    try {
      await sessionManager.logout(sessionId)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      token.value = null
    }
  }

  const logoutAll = async () => {
    try {
      await sessionManager.logoutAll()
    } catch (error) {
      console.error('Logout all error:', error)
    } finally {
      user.value = null
      token.value = null
    }
  }

  const fetchUser = async () => {
    if (!sessionManager.isAuthenticated()) return null

    try {
      const response = await authAPI.getProfile()
      user.value = response.data.user
      return response.data.user
    } catch (err) {
      await logout()
      throw err
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user.value) throw new Error('User not authenticated')

    loading.value = true
    error.value = null

    try {
      const response = await authAPI.updateProfile(profileData)
      user.value = response.data.user
      return response.data.user
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Profile update failed. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    userRole,
    isAdmin,
    isSeller,
    isBuyer,
    login,
    register,
    logout,
    logoutAll,
    fetchUser,
    updateProfile,
  }
})
