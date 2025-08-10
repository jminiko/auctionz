<template>
  <div class="session-aware-wrapper">
    <!-- Session Status Bar (only show when authenticated) -->
    <div v-if="authStore.isAuthenticated" class="session-status-bar">
      <div class="session-info">
        <span class="session-indicator" :class="{ 'session-expiring': isSessionExpiring }">
          {{ sessionStatusText }}
        </span>
        <span class="session-time" v-if="sessionTimeLeft">
          {{ sessionTimeLeft }}
        </span>
      </div>
      <div class="session-actions">
        <button @click="refreshSession" class="btn btn-sm btn-outline" :disabled="refreshing">
          <span v-if="refreshing" class="loading-spinner"></span>
          {{ refreshing ? 'Refreshing...' : 'Refresh' }}
        </button>
        <button @click="showSessionModal = true" class="btn btn-sm btn-secondary">Sessions</button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="session-content">
      <slot />
    </div>

    <!-- Session Management Modal -->
    <div v-if="showSessionModal" class="modal-overlay" @click="showSessionModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Session Management</h3>
          <button @click="showSessionModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="session-overview">
            <div class="current-session">
              <h4>Current Session</h4>
              <div class="session-details">
                <p><strong>Device:</strong> {{ currentSession?.device_info || 'Unknown' }}</p>
                <p><strong>IP Address:</strong> {{ currentSession?.ip_address || 'Unknown' }}</p>
                <p><strong>Last Active:</strong> {{ formatDate(currentSession?.last_used_at) }}</p>
                <p><strong>Expires:</strong> {{ formatDate(currentSession?.expires_at) }}</p>
              </div>
            </div>

            <div class="active-sessions">
              <h4>Active Sessions ({{ sessions.length }})</h4>
              <div class="sessions-list">
                <div
                  v-for="session in sessions"
                  :key="session.id"
                  class="session-item"
                  :class="{ 'current-session-item': session.id === currentSessionId }"
                >
                  <div class="session-info">
                    <div class="session-device">{{ session.device_info }}</div>
                    <div class="session-meta">
                      <span class="session-ip">{{ session.ip_address }}</span>
                      <span class="session-time">{{ formatDate(session.last_used_at) }}</span>
                    </div>
                  </div>
                  <div class="session-actions">
                    <span v-if="session.id === currentSessionId" class="current-badge"
                      >Current</span
                    >
                    <button
                      v-else
                      @click="revokeSession(session.id)"
                      class="btn btn-sm btn-danger"
                      :disabled="revokingSession === session.id"
                    >
                      {{ revokingSession === session.id ? 'Revoking...' : 'Revoke' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="logoutAll" class="btn btn-danger" :disabled="loggingOut">
            {{ loggingOut ? 'Logging Out...' : 'Logout All Devices' }}
          </button>
          <button @click="showSessionModal = false" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- Session Expiry Warning Modal -->
    <div v-if="showExpiryWarning" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>Session Expiring Soon</h3>
        </div>
        <div class="modal-content">
          <p>
            Your session will expire in {{ sessionTimeLeft }}. Would you like to extend your
            session?
          </p>
        </div>
        <div class="modal-footer">
          <button @click="extendSession" class="btn btn-primary" :disabled="extending">
            {{ extending ? 'Extending...' : 'Extend Session' }}
          </button>
          <button @click="showExpiryWarning = false" class="btn btn-secondary">Dismiss</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { sessionManager, type Session } from '@/services/session'

const authStore = useAuthStore()

// Reactive state
const sessions = ref<Session[]>([])
const currentSessionId = ref<string | null>(null)
const showSessionModal = ref(false)
const showExpiryWarning = ref(false)
const refreshing = ref(false)
const extending = ref(false)
const loggingOut = ref(false)
const revokingSession = ref<string | null>(null)

// Session expiry tracking
const sessionExpiryTime = ref<number | null>(null)
const sessionCheckInterval = ref<number | null>(null)
const expiryWarningInterval = ref<number | null>(null)

// Computed properties
const currentSession = computed(() => {
  return sessions.value.find((session) => session.id === currentSessionId.value)
})

const isSessionExpiring = computed(() => {
  if (!sessionExpiryTime.value) return false
  const timeLeft = sessionExpiryTime.value - Date.now()
  return timeLeft < 5 * 60 * 1000 // 5 minutes
})

const sessionStatusText = computed(() => {
  if (!authStore.isAuthenticated) return 'Not authenticated'
  if (isSessionExpiring.value) return 'Session expiring soon'
  return 'Session active'
})

const sessionTimeLeft = computed(() => {
  if (!sessionExpiryTime.value) return null

  const timeLeft = sessionExpiryTime.value - Date.now()
  if (timeLeft <= 0) return 'Expired'

  const minutes = Math.floor(timeLeft / (1000 * 60))
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

// Methods
const loadSessions = async () => {
  try {
    sessions.value = await sessionManager.getSessions()
    currentSessionId.value = sessionManager.getSessionId()

    // Find current session expiry time
    const currentSession = sessions.value.find((s) => s.id === currentSessionId.value)
    if (currentSession) {
      sessionExpiryTime.value = new Date(currentSession.expires_at).getTime()
    }
  } catch (error) {
    console.error('Failed to load sessions:', error)
  }
}

const refreshSession = async () => {
  if (refreshing.value) return

  refreshing.value = true
  try {
    await sessionManager.refreshAccessToken()
    await loadSessions()
  } catch (error) {
    console.error('Failed to refresh session:', error)
  } finally {
    refreshing.value = false
  }
}

const extendSession = async () => {
  if (extending.value) return

  extending.value = true
  try {
    await refreshSession()
    showExpiryWarning.value = false
  } catch (error) {
    console.error('Failed to extend session:', error)
  } finally {
    extending.value = false
  }
}

const revokeSession = async (sessionId: string) => {
  if (revokingSession.value) return

  revokingSession.value = sessionId
  try {
    await sessionManager.revokeSession(sessionId)
    await loadSessions()
  } catch (error) {
    console.error('Failed to revoke session:', error)
  } finally {
    revokingSession.value = null
  }
}

const logoutAll = async () => {
  if (loggingOut.value) return

  loggingOut.value = true
  try {
    await authStore.logoutAll()
  } catch (error) {
    console.error('Failed to logout all sessions:', error)
  } finally {
    loggingOut.value = false
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}

const checkSessionExpiry = () => {
  if (!sessionExpiryTime.value) return

  const timeLeft = sessionExpiryTime.value - Date.now()

  // Show warning 5 minutes before expiry
  if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0 && !showExpiryWarning.value) {
    showExpiryWarning.value = true
  }

  // Auto logout when expired
  if (timeLeft <= 0) {
    authStore.logout()
  }
}

// Lifecycle
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadSessions()

    // Set up session monitoring
    sessionCheckInterval.value = window.setInterval(checkSessionExpiry, 1000) // Check every second
    expiryWarningInterval.value = window.setInterval(() => {
      if (sessionExpiryTime.value) {
        const timeLeft = sessionExpiryTime.value - Date.now()
        if (timeLeft <= 5 * 60 * 1000 && timeLeft > 0) {
          checkSessionExpiry()
        }
      }
    }, 30000) // Check every 30 seconds
  }
})

onUnmounted(() => {
  if (sessionCheckInterval.value) {
    clearInterval(sessionCheckInterval.value)
  }
  if (expiryWarningInterval.value) {
    clearInterval(expiryWarningInterval.value)
  }
})

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (isAuthenticated) {
      await loadSessions()
    } else {
      sessions.value = []
      currentSessionId.value = null
      sessionExpiryTime.value = null
    }
  },
)
</script>

<style scoped>
.session-aware-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.session-status-bar {
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.session-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  background: var(--color-success);
  color: white;
}

.session-indicator.session-expiring {
  background: var(--color-warning);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.session-time {
  color: var(--color-text);
  font-family: monospace;
}

.session-actions {
  display: flex;
  gap: 0.5rem;
}

.session-content {
  flex: 1;
}

.session-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.current-session {
  background: var(--color-background-soft);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.current-session h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
}

.session-details p {
  margin: 0.5rem 0;
  color: var(--color-text);
}

.active-sessions h4 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-white);
}

.session-item.current-session-item {
  border-color: var(--color-primary);
  background: var(--color-background-soft);
}

.session-info {
  flex: 1;
}

.session-device {
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.session-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .session-status-bar {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .session-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .session-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .session-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
