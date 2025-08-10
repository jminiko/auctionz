<template>
  <div v-if="isVisible" class="logout-modal-overlay" @click="closeModal">
    <div class="logout-modal" @click.stop>
      <div class="modal-header">
        <h2>Logout Options</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <div class="modal-content">
        <div class="user-info">
          <div class="user-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="user-details">
            <div class="user-name">{{ currentUser?.first_name }} {{ currentUser?.last_name }}</div>
            <div class="user-email">{{ currentUser?.email }}</div>
            <div class="session-info">
              <span class="session-label">Current Session:</span>
              <span class="session-device">{{ getCurrentDeviceInfo() }}</span>
            </div>
          </div>
        </div>

        <div class="logout-options">
          <div class="option-group">
            <h3>Logout Options</h3>

            <div class="logout-option" @click="handleLogoutCurrent">
              <div class="option-icon">🚪</div>
              <div class="option-content">
                <div class="option-title">Logout Current Session</div>
                <div class="option-description">
                  End your session on this device only. You'll remain logged in on other devices.
                </div>
              </div>
            </div>

            <div class="logout-option" @click="handleLogoutAll">
              <div class="option-icon">🔒</div>
              <div class="option-content">
                <div class="option-title">Logout All Devices</div>
                <div class="option-description">
                  End your session on all devices. This is recommended for security.
                </div>
              </div>
            </div>
          </div>

          <div class="option-group">
            <h3>Session Management</h3>

            <div class="logout-option" @click="goToSessions">
              <div class="option-icon">📱</div>
              <div class="option-content">
                <div class="option-title">Manage Active Sessions</div>
                <div class="option-description">
                  View and manage all your active sessions across devices.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logoutService, type LogoutOptions } from '@/services/logout'

interface Props {
  visible: boolean
  showConfirmation?: boolean
  redirectTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  showConfirmation: true,
  redirectTo: '/login',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'logout-success': [result: any]
  'logout-cancelled': []
}>()

const router = useRouter()
const authStore = useAuthStore()

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const currentUser = computed(() => authStore.user)

const closeModal = () => {
  isVisible.value = false
}

const getUserInitials = () => {
  const user = currentUser.value
  if (!user) return 'U'
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

const getCurrentDeviceInfo = () => {
  const userAgent = navigator.userAgent
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'Mobile Device'
  } else if (/Tablet|iPad/.test(userAgent)) {
    return 'Tablet'
  } else {
    return 'Desktop'
  }
}

const handleLogoutCurrent = async () => {
  try {
    const options: LogoutOptions = {
      showConfirmation: props.showConfirmation,
      redirectTo: props.redirectTo,
      reason: 'User initiated logout from current session',
    }

    const result = await logoutService.logoutCurrentSession(options)

    if (result.success) {
      emit('logout-success', result)
      closeModal()
    } else if (!result.redirected) {
      // User cancelled
      emit('logout-cancelled')
    }
  } catch (error) {
    console.error('Logout current error:', error)
  }
}

const handleLogoutAll = async () => {
  try {
    const options: LogoutOptions = {
      showConfirmation: props.showConfirmation,
      redirectTo: props.redirectTo,
      clearAllData: true,
      reason: 'User initiated logout from all devices',
    }

    const result = await logoutService.logoutAllDevices(options)

    if (result.success) {
      emit('logout-success', result)
      closeModal()
    } else if (!result.redirected) {
      // User cancelled
      emit('logout-cancelled')
    }
  } catch (error) {
    console.error('Logout all error:', error)
  }
}

const goToSessions = () => {
  closeModal()
  router.push('/sessions')
}
</script>

<style scoped>
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(107, 114, 128, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.logout-modal {
  background: #f8fafc;
  border-radius: 1.5rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.modal-content {
  padding: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #cbd5e1;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.user-email {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.session-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.session-label {
  color: #64748b;
}

.session-device {
  color: #3b82f6;
  font-weight: 500;
}

.logout-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
}

.logout-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
}

.logout-option:hover {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1);
}

.option-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 0.75rem;
  border: 1px solid #bae6fd;
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.option-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  margin-top: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
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

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}

.btn-secondary:hover {
  background: #e2e8f0;
  color: #334155;
}

@media (max-width: 640px) {
  .logout-modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1rem;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .logout-option {
    flex-direction: column;
    text-align: center;
  }

  .option-icon {
    margin-bottom: 0.5rem;
  }
}
</style>
