<template>
  <div class="logout-page">
    <div class="logout-container">
      <div class="logout-header">
        <div class="user-avatar">
          {{ getUserInitials() }}
        </div>
        <h1>Logout Options</h1>
        <p>Choose how you want to logout from your account</p>
      </div>

      <div class="logout-options">
        <div class="option-card" @click="handleLogoutCurrent">
          <div class="option-icon">🚪</div>
          <div class="option-content">
            <h3>Logout Current Session</h3>
            <p>End your session on this device only. You'll remain logged in on other devices.</p>
            <ul class="option-benefits">
              <li>Quick logout from this device</li>
              <li>Keep other sessions active</li>
              <li>Easy to log back in</li>
            </ul>
          </div>
          <div class="option-action">
            <button class="btn btn-primary" :disabled="loading">
              {{ loading ? 'Logging out...' : 'Logout Current' }}
            </button>
          </div>
        </div>

        <div class="option-card recommended" @click="handleLogoutAll">
          <div class="option-icon">🔒</div>
          <div class="option-content">
            <h3>Logout All Devices</h3>
            <p class="recommended-badge">Recommended for Security</p>
            <p>End your session on all devices. This is the most secure option.</p>
            <ul class="option-benefits">
              <li>Maximum security</li>
              <li>Ends all active sessions</li>
              <li>Protects your account</li>
            </ul>
          </div>
          <div class="option-action">
            <button class="btn btn-danger" :disabled="loading">
              {{ loading ? 'Logging out...' : 'Logout All' }}
            </button>
          </div>
        </div>

        <div class="option-card" @click="goToSessions">
          <div class="option-icon">📱</div>
          <div class="option-content">
            <h3>Manage Sessions</h3>
            <p>View and manage all your active sessions across devices.</p>
            <ul class="option-benefits">
              <li>See all active sessions</li>
              <li>Revoke specific sessions</li>
              <li>Monitor device activity</li>
            </ul>
          </div>
          <div class="option-action">
            <button class="btn btn-outline">Manage Sessions</button>
          </div>
        </div>
      </div>

      <div class="logout-footer">
        <button @click="goBack" class="btn btn-secondary">Cancel</button>
        <div class="session-info">
          <p>Current Session: {{ getCurrentDeviceInfo() }}</p>
          <p>Last Activity: {{ getLastActivity() }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { logoutService } from '@/services/logout'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)

onMounted(() => {
  // Redirect to login if not authenticated
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})

const getUserInitials = () => {
  const user = authStore.user
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

const getLastActivity = () => {
  // This would come from the session data
  return 'Just now'
}

const handleLogoutCurrent = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const result = await logoutService.logoutCurrentSession({
      showConfirmation: true,
      redirectTo: '/login',
      reason: 'User initiated logout from logout page',
    })

    if (result.success) {
      // Redirect handled by logout service
    } else if (!result.redirected) {
      // User cancelled
      loading.value = false
    }
  } catch (error) {
    console.error('Logout current error:', error)
    loading.value = false
  }
}

const handleLogoutAll = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const result = await logoutService.logoutAllDevices({
      showConfirmation: true,
      redirectTo: '/login',
      clearAllData: true,
      reason: 'User initiated logout all from logout page',
    })

    if (result.success) {
      // Redirect handled by logout service
    } else if (!result.redirected) {
      // User cancelled
      loading.value = false
    }
  } catch (error) {
    console.error('Logout all error:', error)
    loading.value = false
  }
}

const goToSessions = () => {
  router.push('/sessions')
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.logout-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.logout-container {
  background: #ffffff;
  border-radius: 2rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 800px;
  width: 100%;
  padding: 3rem 2rem;
  border: 1px solid #e2e8f0;
}

.logout-header {
  text-align: center;
  margin-bottom: 3rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 16px -4px rgba(59, 130, 246, 0.3);
}

.logout-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.logout-header p {
  color: #64748b;
  font-size: 1.125rem;
}

.logout-options {
  display: grid;
  gap: 2rem;
  margin-bottom: 3rem;
}

.option-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1.5rem;
  padding: 2rem;
  border: 2px solid #e2e8f0;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
  background: #ffffff;
}

.option-card:hover {
  border-color: #3b82f6;
  transform: translateY(-3px);
  box-shadow: 0 20px 40px rgba(59, 130, 246, 0.1);
}

.option-card.recommended {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 50%, #fca5a5 100%);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.1);
}

.option-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 1.5rem;
  border: 2px solid #bae6fd;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
}

.option-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.recommended-badge {
  display: inline-block;
  background: #dc2626;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.option-content p {
  color: #64748b;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.option-benefits {
  list-style: none;
  padding: 0;
  margin: 0;
}

.option-benefits li {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
  padding-left: 1.5rem;
  position: relative;
}

.option-benefits li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #166534;
  font-weight: bold;
}

.option-action {
  text-align: center;
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
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(59, 130, 246, 0.3);
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

.btn-outline {
  background: transparent;
  color: #475569;
  border-color: #cbd5e1;
}

.btn-outline:hover {
  background: #f8fafc;
  color: #334155;
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

.logout-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.session-info {
  text-align: right;
}

.session-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .logout-container {
    padding: 2rem 1rem;
  }

  .option-card {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }

  .option-icon {
    width: 60px;
    height: 60px;
    font-size: 2rem;
    margin: 0 auto;
  }

  .logout-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .session-info {
    text-align: center;
  }
}
</style>
