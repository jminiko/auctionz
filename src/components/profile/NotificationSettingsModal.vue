<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>Notification Settings</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-content">
        <div class="notification-settings">
          <div class="notification-item">
            <div class="notification-info">
              <h4>Email Notifications</h4>
              <p>Receive notifications about auctions, bids, and account updates via email</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.notification_email" :disabled="loading" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <h4>SMS Notifications</h4>
              <p>Get important alerts and updates via text message</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.notification_sms" :disabled="loading" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <h4>Push Notifications</h4>
              <p>Receive real-time updates and notifications in your browser</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.notification_push" :disabled="loading" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="notification-preview">
          <h4>Notification Preview</h4>
          <div class="preview-item">
            <div class="preview-icon">🏷️</div>
            <div class="preview-content">
              <h5>New Auction Created</h5>
              <p>Your auction "Vintage Watch" has been successfully created and is now live.</p>
            </div>
          </div>
          <div class="preview-item">
            <div class="preview-icon">💰</div>
            <div class="preview-content">
              <h5>New Bid Received</h5>
              <p>Someone placed a bid of $150 on your auction "Antique Vase".</p>
            </div>
          </div>
          <div class="preview-item">
            <div class="preview-icon">⏰</div>
            <div class="preview-content">
              <h5>Auction Ending Soon</h5>
              <p>Your auction "Rare Coin Collection" ends in 1 hour. Current bid: $500.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            @click="$emit('close')"
            class="btn btn-secondary"
            :disabled="loading"
          >
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { usersAPI } from '@/services/api'

interface Props {
  settings: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  updated: []
}>()

const loading = ref(false)

const settings = reactive({
  notification_email: true,
  notification_sms: false,
  notification_push: true,
})

const handleSubmit = async () => {
  try {
    loading.value = true

    await usersAPI.updateSettings(settings)

    emit('updated')
  } catch (error) {
    console.error('Failed to update notification settings:', error)
    alert('Failed to update notification settings. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Populate settings with current user data
  if (props.settings) {
    settings.notification_email = props.settings.notification_email ?? true
    settings.notification_sms = props.settings.notification_sms ?? false
    settings.notification_push = props.settings.notification_push ?? true
  }
})
</script>

<style scoped>
.modal-overlay {
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

.modal {
  background: #f8fafc;
  border-radius: 1.5rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
}

.modal-header h3 {
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
  padding: 2rem;
}

.notification-settings {
  margin-bottom: 2rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  margin-bottom: 1rem;
  transition: all 0.2s ease;
}

.notification-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
}

.notification-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.notification-info p {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: #3498db;
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.toggle input:disabled + .toggle-slider {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-preview {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.notification-preview h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.preview-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-icon {
  font-size: 1.25rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.preview-content h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.preview-content p {
  color: #64748b;
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1rem;
  }

  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
