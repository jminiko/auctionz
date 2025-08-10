<template>
  <div class="session-navigation">
    <!-- Session Status -->
    <div v-if="authStore.isAuthenticated" class="session-status">
      <div class="status-indicator" :class="{ expiring: isSessionExpiring }">
        <span class="status-dot"></span>
        <span class="status-text">{{ sessionStatusText }}</span>
      </div>

      <div class="session-time" v-if="sessionTimeLeft">
        <span class="time-label">Expires in:</span>
        <span class="time-value">{{ sessionTimeLeft }}</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        @click="refreshSession"
        class="action-btn refresh-btn"
        :disabled="refreshing"
        :title="refreshing ? 'Refreshing session...' : 'Refresh session'"
      >
        <span v-if="refreshing" class="loading-spinner"></span>
        <span v-else>🔄</span>
      </button>

      <button
        @click="showSessionInfo = true"
        class="action-btn info-btn"
        title="Session information"
      >
        ℹ️
      </button>

      <button @click="logout" class="action-btn logout-btn" title="Logout">🚪</button>
    </div>

    <!-- Session Info Modal -->
    <div v-if="showSessionInfo" class="modal-overlay" @click="showSessionInfo = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Session Information</h3>
          <button @click="showSessionInfo = false" class="close-btn">×</button>
        </div>
        <div class="modal-content">
          <div class="session-details">
            <div class="detail-item">
              <label>User:</label>
              <span>{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            </div>
            <div class="detail-item">
              <label>Role:</label>
              <span class="role-badge">{{ authStore.userRole }}</span>
            </div>
            <div class="detail-item">
              <label>Session ID:</label>
              <span class="session-id">{{ currentSessionId }}</span>
            </div>
            <div class="detail-item">
              <label>Last Active:</label>
              <span>{{ formatDate(currentSession?.last_used_at) }}</span>
            </div>
            <div class="detail-item">
              <label>Expires:</label>
              <span>{{ formatDate(currentSession?.expires_at) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showSessionInfo = false" class="btn btn-secondary">Close</button>
          <router-link to="/sessions" class="btn btn-primary">Manage Sessions</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sessionManager, type Session } from '@/services/session'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const sessions = ref<Session[]>([])
const currentSessionId = ref<string | null>(null)
const showSessionInfo = ref(false)
const refreshing = ref(false)
const sessionExpiryTime = ref<number | null>(null)

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
  if (isSessionExpiring.value) return 'Expiring soon'
  return 'Active'
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

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleString()
}

// Lifecycle
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await loadSessions()
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
.session-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
  font-size: 0.875rem;
}

.session-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background: var(--color-success);
  color: white;
  font-weight: 500;
}

.status-indicator.expiring {
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

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.session-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
}

.time-label {
  font-weight: 500;
}

.time-value {
  font-family: monospace;
  font-weight: 600;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 0.5rem;
  background: var(--color-white);
  color: var(--color-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 1rem;
}

.action-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn {
  background: var(--color-background-soft);
}

.info-btn {
  background: var(--color-background-soft);
}

.logout-btn {
  background: var(--color-background-soft);
}

.logout-btn:hover {
  background: var(--color-danger);
  color: white;
}

.session-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-border);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 600;
  color: var(--color-heading);
}

.detail-item span {
  color: var(--color-text);
}

.role-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.session-id {
  font-family: monospace;
  font-size: 0.875rem;
  background: var(--color-background-soft);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

@media (max-width: 768px) {
  .session-navigation {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .session-status {
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-actions {
    justify-content: center;
  }
}
</style>
