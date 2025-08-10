<template>
  <div class="session-manager">
    <div class="session-header">
      <h2>Active Sessions</h2>
      <p>Manage your active sessions across different devices</p>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading sessions...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadSessions" class="btn btn-primary">Retry</button>
    </div>

    <div v-else class="sessions-list">
      <div v-for="session in sessions" :key="session.id" class="session-item">
        <div class="session-info">
          <div class="session-icon">
            {{ getDeviceIcon(session.device_info) }}
          </div>
          <div class="session-details">
            <div class="device-name">{{ session.device_info }}</div>
            <div class="session-meta">
              <span class="ip-address">{{ session.ip_address }}</span>
              <span class="last-used">Last used: {{ formatDate(session.last_used_at) }}</span>
            </div>
            <div class="session-status">
              <span class="status-badge" :class="{ active: session.is_active }">
                {{ session.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span v-if="isCurrentSession(session.id)" class="current-session">
                Current Session
              </span>
            </div>
          </div>
        </div>

        <div class="session-actions">
          <button
            v-if="!isCurrentSession(session.id)"
            @click="revokeSession(session.id)"
            class="btn btn-danger"
            :disabled="revokingSession === session.id"
          >
            {{ revokingSession === session.id ? 'Revoking...' : 'Revoke' }}
          </button>
          <span v-else class="current-indicator">Current</span>
        </div>
      </div>
    </div>

    <div class="session-actions-footer">
      <button @click="logoutAll" class="btn btn-danger" :disabled="loggingOutAll">
        {{ loggingOutAll ? 'Logging out...' : 'Logout from All Devices' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sessionManager, type Session } from '@/services/session'
import { useAuthStore } from '@/stores/auth'
import { logoutService } from '@/services/logout'

const authStore = useAuthStore()

const sessions = ref<Session[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const revokingSession = ref<string | null>(null)
const loggingOutAll = ref(false)

const loadSessions = async () => {
  loading.value = true
  error.value = null

  try {
    sessions.value = await sessionManager.getSessions()
  } catch (err: any) {
    error.value = err.message || 'Failed to load sessions'
  } finally {
    loading.value = false
  }
}

const revokeSession = async (sessionId: string) => {
  revokingSession.value = sessionId

  try {
    await sessionManager.revokeSession(sessionId)
    // Remove session from list
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
  } catch (err: any) {
    error.value = err.message || 'Failed to revoke session'
  } finally {
    revokingSession.value = null
  }
}

const logoutAll = async () => {
  loggingOutAll.value = true

  try {
    const result = await logoutService.logoutAllDevices({
      showConfirmation: true,
      redirectTo: '/login',
      clearAllData: true,
      reason: 'User initiated logout all from session manager',
    })

    if (result.success) {
      // Redirect handled by logout service
    } else if (!result.redirected) {
      // User cancelled
      loggingOutAll.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to logout from all devices'
    loggingOutAll.value = false
  }
}

const isCurrentSession = (sessionId: string) => {
  return sessionManager.getSessionId() === sessionId
}

const getDeviceIcon = (deviceInfo: string) => {
  switch (deviceInfo.toLowerCase()) {
    case 'mobile':
      return '📱'
    case 'tablet':
      return '📱'
    case 'desktop':
      return '💻'
    default:
      return '🖥️'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped>
.session-manager {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.session-header {
  text-align: center;
  margin-bottom: 2rem;
}

.session-header h2 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.session-header p {
  color: #64748b;
  font-size: 1rem;
}

.loading,
.error {
  text-align: center;
  padding: 3rem 2rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-border);
  border-top: 2px solid var(--color-heading);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error p {
  color: #dc2626;
  margin-bottom: 1rem;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.session-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
  border-color: #3b82f6;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.session-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 1rem;
  border: 1px solid #bae6fd;
}

.session-details {
  flex: 1;
}

.device-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.session-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.session-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-badge.active {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #166534;
  border: 1px solid #bbf7d0;
}

.current-session {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: 500;
}

.session-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-indicator {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 500;
}

.session-actions-footer {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-heading);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1a202c;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
}

.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .session-manager {
    padding: 1rem;
  }

  .session-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .session-info {
    flex-direction: column;
  }

  .session-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .session-actions {
    width: 100%;
    justify-content: center;
  }
}
</style>
