<template>
  <div class="logout-button-container">
    <!-- Simple logout button -->
    <button
      v-if="variant === 'simple'"
      @click="handleSimpleLogout"
      class="logout-btn simple"
      :disabled="loading"
      :title="tooltip"
    >
      <span v-if="loading" class="loading-spinner"></span>
      <span v-else class="btn-icon">{{ icon }}</span>
      <span v-if="showText" class="btn-text">{{ text }}</span>
    </button>

    <!-- Dropdown logout button -->
    <div v-else-if="variant === 'dropdown'" class="logout-dropdown">
      <button
        @click="toggleDropdown"
        class="logout-btn dropdown-trigger"
        :disabled="loading"
        :title="tooltip"
      >
        <span v-if="loading" class="loading-spinner"></span>
        <span v-else class="btn-icon">{{ icon }}</span>
        <span v-if="showText" class="btn-text">{{ text }}</span>
        <span class="dropdown-arrow">▼</span>
      </button>

      <div v-if="showDropdown" class="dropdown-menu">
        <div class="dropdown-item" @click="handleLogoutCurrent">
          <span class="item-icon">🚪</span>
          <span class="item-text">Logout Current Session</span>
        </div>
        <div class="dropdown-item" @click="handleLogoutAll">
          <span class="item-icon">🔒</span>
          <span class="item-text">Logout All Devices</span>
        </div>
        <div class="dropdown-divider"></div>
        <div class="dropdown-item" @click="goToSessions">
          <span class="item-icon">📱</span>
          <span class="item-text">Manage Sessions</span>
        </div>
      </div>
    </div>

    <!-- Modal logout button -->
    <button
      v-else-if="variant === 'modal'"
      @click="showLogoutModal = true"
      class="logout-btn modal"
      :disabled="loading"
      :title="tooltip"
    >
      <span v-if="loading" class="loading-spinner"></span>
      <span v-else class="btn-icon">{{ icon }}</span>
      <span v-if="showText" class="btn-text">{{ text }}</span>
    </button>

    <!-- Logout Modal -->
    <LogoutModal
      v-if="variant === 'modal'"
      v-model:visible="showLogoutModal"
      :show-confirmation="showConfirmation"
      :redirect-to="redirectTo"
      @logout-success="handleLogoutSuccess"
      @logout-cancelled="handleLogoutCancelled"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { logoutService } from '@/services/logout'
import LogoutModal from './LogoutModal.vue'

interface Props {
  variant?: 'simple' | 'dropdown' | 'modal'
  text?: string
  icon?: string
  showText?: boolean
  showConfirmation?: boolean
  redirectTo?: string
  tooltip?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'simple',
  text: 'Logout',
  icon: '🚪',
  showText: true,
  showConfirmation: true,
  redirectTo: '/login',
  tooltip: 'Logout from your account',
  loading: false,
})

const emit = defineEmits<{
  'logout-success': [result: any]
  'logout-cancelled': []
  'logout-error': [error: any]
}>()

const router = useRouter()
const showDropdown = ref(false)
const showLogoutModal = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleSimpleLogout = async () => {
  try {
    const result = await logoutService.logoutCurrentSession({
      showConfirmation: props.showConfirmation,
      redirectTo: props.redirectTo,
      reason: 'User clicked logout button',
    })

    if (result.success) {
      emit('logout-success', result)
    } else if (!result.redirected) {
      emit('logout-cancelled')
    }
  } catch (error) {
    console.error('Simple logout error:', error)
    emit('logout-error', error)
  }
}

const handleLogoutCurrent = async () => {
  showDropdown.value = false
  try {
    const result = await logoutService.logoutCurrentSession({
      showConfirmation: props.showConfirmation,
      redirectTo: props.redirectTo,
      reason: 'User selected logout current session',
    })

    if (result.success) {
      emit('logout-success', result)
    } else if (!result.redirected) {
      emit('logout-cancelled')
    }
  } catch (error) {
    console.error('Logout current error:', error)
    emit('logout-error', error)
  }
}

const handleLogoutAll = async () => {
  showDropdown.value = false
  try {
    const result = await logoutService.logoutAllDevices({
      showConfirmation: props.showConfirmation,
      redirectTo: props.redirectTo,
      clearAllData: true,
      reason: 'User selected logout all devices',
    })

    if (result.success) {
      emit('logout-success', result)
    } else if (!result.redirected) {
      emit('logout-cancelled')
    }
  } catch (error) {
    console.error('Logout all error:', error)
    emit('logout-error', error)
  }
}

const goToSessions = () => {
  showDropdown.value = false
  router.push('/sessions')
}

const handleLogoutSuccess = (result: any) => {
  emit('logout-success', result)
}

const handleLogoutCancelled = () => {
  emit('logout-cancelled')
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.logout-dropdown')) {
    showDropdown.value = false
  }
}

// Add click outside listener
if (props.variant === 'dropdown') {
  document.addEventListener('click', handleClickOutside)
}
</script>

<style scoped>
.logout-button-container {
  position: relative;
  display: inline-block;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.logout-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.logout-btn.simple {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: #dc2626;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2);
}

.logout-btn.simple:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  border-color: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(239, 68, 68, 0.3);
}

.logout-btn.modal {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-color: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.logout-btn.modal:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  border-color: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.logout-dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  min-width: 200px;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dropdown-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
  margin: 0.5rem 0;
}

.item-icon {
  font-size: 1rem;
  width: 1.5rem;
  text-align: center;
}

.item-text {
  font-size: 0.875rem;
  color: #475569;
}

@media (max-width: 640px) {
  .logout-btn {
    padding: 0.5rem;
  }

  .btn-text {
    display: none;
  }

  .dropdown-menu {
    right: -1rem;
    min-width: 180px;
  }
}
</style>
