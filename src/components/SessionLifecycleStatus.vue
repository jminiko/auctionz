<template>
  <div class="session-lifecycle-status">
    <!-- Session Status Indicator -->
    <div v-if="authStore.isAuthenticated" class="status-indicator">
      <div class="status-dot" :class="statusClass"></div>
      <span class="status-text">{{ statusText }}</span>
      <span v-if="timeLeft" class="time-left">{{ timeLeft }}</span>
    </div>

    <!-- Session Controls -->
    <div v-if="authStore.isAuthenticated" class="session-controls">
      <button
        @click="refreshSession"
        class="control-btn refresh-btn"
        :disabled="sessionLifecycle.isValidationInProgress"
        :title="sessionLifecycle.isValidationInProgress ? 'Validating...' : 'Refresh Session'"
      >
        <span v-if="sessionLifecycle.isValidationInProgress" class="spinner"></span>
        <span v-else>🔄</span>
      </button>

      <button
        @click="showSessionInfo = true"
        class="control-btn info-btn"
        title="Session Information"
      >
        ℹ️
      </button>

      <button @click="forceLogout" class="control-btn logout-btn" title="Force Logout">🚪</button>
    </div>

    <!-- Session Information Modal -->
    <div v-if="showSessionInfo" class="modal-overlay" @click="showSessionInfo = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Session Information</h3>
          <button @click="showSessionInfo = false" class="close-btn">×</button>
        </div>

        <div class="modal-content">
          <div class="session-info-grid">
            <div class="info-item">
              <label>Status:</label>
              <span :class="statusClass">{{ statusText }}</span>
            </div>

            <div class="info-item">
              <label>User:</label>
              <span>{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            </div>

            <div class="info-item">
              <label>Role:</label>
              <span>{{ authStore.userRole }}</span>
            </div>

            <div class="info-item">
              <label>Session ID:</label>
              <span class="session-id">{{ sessionLifecycle.currentSession?.id || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <label>Device:</label>
              <span>{{ sessionLifecycle.currentSession?.device_info || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <label>IP Address:</label>
              <span>{{ sessionLifecycle.currentSession?.ip_address || 'N/A' }}</span>
            </div>

            <div class="info-item">
              <label>Created:</label>
              <span>{{ formatDate(sessionLifecycle.currentSession?.created_at) }}</span>
            </div>

            <div class="info-item">
              <label>Last Active:</label>
              <span>{{ formatDate(sessionLifecycle.currentSession?.last_used_at) }}</span>
            </div>

            <div class="info-item">
              <label>Expires:</label>
              <span
                :class="{
                  expiring: sessionLifecycle.isSessionExpiring,
                  expired: sessionLifecycle.isSessionExpired,
                }"
              >
                {{ formatDate(sessionLifecycle.sessionExpiryTime) }}
              </span>
            </div>

            <div class="info-item">
              <label>Last Validation:</label>
              <span>{{ formatDate(sessionLifecycle.lastValidationTime) }}</span>
            </div>
          </div>

          <div class="session-actions">
            <button
              @click="refreshSession"
              class="btn btn-primary"
              :disabled="sessionLifecycle.isValidationInProgress"
            >
              {{ sessionLifecycle.isValidationInProgress ? 'Validating...' : 'Refresh Session' }}
            </button>
            <button @click="forceLogout" class="btn btn-outline">Force Logout</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Expiry Warning Modal -->
    <div v-if="sessionLifecycle.isSessionExpiring && !showExpiryWarning" class="modal-overlay">
      <div class="modal warning-modal">
        <div class="modal-header">
          <h3>⚠️ Session Expiring Soon</h3>
        </div>

        <div class="modal-content">
          <p>Your session will expire in {{ timeLeft }}. Would you like to extend your session?</p>

          <div class="warning-actions">
            <button @click="refreshSession" class="btn btn-primary">Extend Session</button>
            <button @click="showExpiryWarning = true" class="btn btn-outline">Continue</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSessionLifecycle } from '@/services/sessionLifecycle'

const authStore = useAuthStore()
const sessionLifecycle = useSessionLifecycle()

// Reactive state
const showSessionInfo = ref(false)
const showExpiryWarning = ref(false)
const timeUpdateInterval = ref<number | null>(null)

// Computed properties
const statusClass = computed(() => {
  if (sessionLifecycle.isSessionExpired.value) return 'expired'
  if (sessionLifecycle.isSessionExpiring.value) return 'expiring'
  if (sessionLifecycle.isValidationInProgress.value) return 'validating'
  return 'active'
})

const statusText = computed(() => {
  if (sessionLifecycle.isSessionExpired.value) return 'Expired'
  if (sessionLifecycle.isSessionExpiring.value) return 'Expiring Soon'
  if (sessionLifecycle.isValidationInProgress.value) return 'Validating'
  return 'Active'
})

const timeLeft = computed(() => {
  if (!sessionLifecycle.sessionExpiryTime.value) return null

  const now = Date.now()
  const expiry = sessionLifecycle.sessionExpiryTime.value.getTime()
  const diff = expiry - now

  if (diff <= 0) return 'Expired'

  const minutes = Math.floor(diff / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
})

// Methods
const refreshSession = async () => {
  try {
    const success = await sessionLifecycle.refreshSession()
    if (success) {
      console.log('Session refreshed successfully')
    } else {
      console.error('Session refresh failed')
    }
  } catch (error) {
    console.error('Error refreshing session:', error)
  }
}

const forceLogout = async () => {
  if (confirm('Are you sure you want to force logout? This will end your current session.')) {
    try {
      await sessionLifecycle.forceLogout('Manual force logout')
    } catch (error) {
      console.error('Error during force logout:', error)
    }
  }
}

const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleString()
  } catch (error) {
    return 'Invalid Date'
  }
}

// Lifecycle
onMounted(() => {
  // Update time display every second
  timeUpdateInterval.value = window.setInterval(() => {
    // This will trigger reactivity for timeLeft computed property
  }, 1000)
})

onUnmounted(() => {
  if (timeUpdateInterval.value) {
    clearInterval(timeUpdateInterval.value)
    timeUpdateInterval.value = null
  }
})
</script>

<style scoped>
.session-lifecycle-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

.status-dot.active {
  background: var(--color-success);
}

.status-dot.expiring {
  background: var(--color-warning);
  animation: pulse 2s infinite;
}

.status-dot.expired {
  background: var(--color-danger);
}

.status-dot.validating {
  background: var(--color-primary);
  animation: spin 1s linear infinite;
}

.status-text {
  font-weight: 500;
  color: var(--color-heading);
}

.time-left {
  font-size: 0.75rem;
  color: var(--color-text);
  background: var(--color-white);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.session-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-white);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.control-btn:hover {
  background: var(--color-background-soft);
  border-color: var(--color-primary);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn .spinner {
  width: 12px;
  height: 12px;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--color-text);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: var(--color-background-soft);
}

.modal-content {
  padding: 1.5rem;
}

.session-info-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: 6px;
}

.info-item label {
  font-weight: 500;
  color: var(--color-heading);
  font-size: 0.875rem;
}

.info-item span {
  color: var(--color-text);
  font-size: 0.875rem;
}

.session-id {
  font-family: monospace;
  font-size: 0.75rem;
  background: var(--color-white);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.expiring {
  color: var(--color-warning);
  font-weight: 500;
}

.expired {
  color: var(--color-danger);
  font-weight: 500;
}

.session-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.warning-modal {
  max-width: 400px;
}

.warning-modal .modal-header {
  background: var(--color-warning);
  color: white;
}

.warning-modal .modal-header h3 {
  color: white;
}

.warning-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

/* Animations */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .session-lifecycle-status {
    flex-direction: column;
    gap: 0.75rem;
  }

  .session-controls {
    justify-content: center;
  }

  .modal {
    width: 95%;
    margin: 1rem;
  }

  .session-actions,
  .warning-actions {
    flex-direction: column;
  }
}
</style>
