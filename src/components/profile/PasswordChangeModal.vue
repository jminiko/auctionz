<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>Change Password</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-content">
        <div class="form-group">
          <label for="current_password">Current Password</label>
          <input
            id="current_password"
            v-model="form.current_password"
            type="password"
            required
            class="form-input"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="new_password">New Password</label>
          <input
            id="new_password"
            v-model="form.new_password"
            type="password"
            required
            class="form-input"
            :disabled="loading"
            minlength="8"
          />
          <small class="form-help">Password must be at least 8 characters long</small>
        </div>

        <div class="form-group">
          <label for="confirm_password">Confirm New Password</label>
          <input
            id="confirm_password"
            v-model="form.confirm_password"
            type="password"
            required
            class="form-input"
            :disabled="loading"
          />
          <small v-if="passwordMismatch" class="form-error">Passwords do not match</small>
        </div>

        <div class="password-strength" v-if="form.new_password">
          <div class="strength-label">Password Strength:</div>
          <div class="strength-bar">
            <div
              class="strength-fill"
              :class="passwordStrength.class"
              :style="{ width: passwordStrength.percentage + '%' }"
            ></div>
          </div>
          <div class="strength-text" :class="passwordStrength.class">
            {{ passwordStrength.text }}
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
          <button type="submit" class="btn btn-primary" :disabled="loading || passwordMismatch">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { usersAPI } from '@/services/api'

const emit = defineEmits<{
  close: []
  updated: []
}>()

const loading = ref(false)

const form = reactive({
  current_password: '',
  new_password: '',
  confirm_password: '',
})

const passwordMismatch = computed(() => {
  return form.new_password && form.confirm_password && form.new_password !== form.confirm_password
})

const passwordStrength = computed(() => {
  const password = form.new_password
  if (!password) return { class: '', text: '', percentage: 0 }

  let score = 0
  let feedback = []

  // Length check
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 25

  // Character variety checks
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^A-Za-z0-9]/.test(password)) score += 15

  // Determine strength level
  if (score < 50) {
    return { class: 'weak', text: 'Weak', percentage: score }
  } else if (score < 75) {
    return { class: 'medium', text: 'Medium', percentage: score }
  } else {
    return { class: 'strong', text: 'Strong', percentage: score }
  }
})

const handleSubmit = async () => {
  if (passwordMismatch.value) {
    return
  }

  try {
    loading.value = true

    await usersAPI.changePassword({
      current_password: form.current_password,
      new_password: form.new_password,
    })

    // Clear form
    form.current_password = ''
    form.new_password = ''
    form.confirm_password = ''

    emit('updated')
  } catch (error: any) {
    console.error('Failed to change password:', error)
    const message = error.response?.data?.error || 'Failed to change password. Please try again.'
    alert(message)
  } finally {
    loading.value = false
  }
}
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

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  color: #1f2937;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-help {
  color: #6b7280;
  font-size: 0.75rem;
}

.form-error {
  color: #dc2626;
  font-size: 0.75rem;
}

.password-strength {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
  border: 1px solid #e2e8f0;
}

.strength-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.strength-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;
}

.strength-fill.weak {
  background: #dc2626;
}

.strength-fill.medium {
  background: #f59e0b;
}

.strength-fill.strong {
  background: #10b981;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.strength-text.weak {
  color: #dc2626;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
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

  .modal-footer {
    flex-direction: column;
  }
}
</style>
