<template>
  <div class="profile">
    <div class="profile-header">
      <h1>Profile Settings</h1>
      <p>Manage your account information and preferences</p>
    </div>

    <div class="profile-content">
      <!-- Profile Summary -->
      <div class="profile-summary">
        <div class="profile-avatar">
          {{ userInitials }}
        </div>
        <div class="profile-info">
          <h2>{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</h2>
          <p>{{ authStore.user?.email }}</p>
          <div class="profile-role">{{ authStore.user?.role }}</div>
        </div>
      </div>

      <!-- Profile Form -->
      <div class="profile-section">
        <h3>Personal Information</h3>
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                required
                class="form-input"
                :disabled="loading"
              />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                required
                class="form-input"
                :disabled="loading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              class="form-input"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea
              id="bio"
              v-model="form.bio"
              rows="4"
              class="form-input"
              :disabled="loading"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <button type="submit" :disabled="loading" class="btn btn-primary">
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Updating...' : 'Update Profile' }}
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="profile-section">
        <h3>Change Password</h3>
        <form @submit.prevent="changePassword" class="profile-form">
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="form-input"
              :disabled="passwordLoading"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="newPassword">New Password</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="form-input"
                :disabled="passwordLoading"
              />
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="form-input"
                :disabled="passwordLoading"
              />
            </div>
          </div>

          <button type="submit" :disabled="passwordLoading" class="btn btn-primary">
            <span v-if="passwordLoading" class="loading-spinner"></span>
            {{ passwordLoading ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
      </div>

      <!-- Notification Settings -->
      <div class="profile-section">
        <h3>Notification Settings</h3>
        <div class="notification-settings">
          <div class="notification-item">
            <div class="notification-info">
              <h4>Email Notifications</h4>
              <p>Receive updates about your auctions and bids via email</p>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="notifications.email"
                @change="updateNotifications"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <h4>SMS Notifications</h4>
              <p>Get important alerts via text message</p>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="notifications.sms"
                @change="updateNotifications"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="notification-item">
            <div class="notification-info">
              <h4>Push Notifications</h4>
              <p>Receive real-time updates in your browser</p>
            </div>
            <label class="toggle">
              <input
                type="checkbox"
                v-model="notifications.push"
                @change="updateNotifications"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="profile-section">
        <h3>Account Actions</h3>
        <div class="account-actions">
          <button @click="downloadData" class="btn btn-outline">
            Download My Data
          </button>
          <button @click="showDeleteModal = true" class="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h3>Delete Account</h3>
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-outline">
            Cancel
          </button>
          <button @click="deleteAccount" class="btn btn-danger">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const passwordLoading = ref(false)
const showDeleteModal = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  bio: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notifications = reactive({
  email: true,
  sms: false,
  push: true
})

const userInitials = computed(() => {
  const user = authStore.user
  if (!user) return ''
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
})

const updateProfile = async () => {
  loading.value = true
  try {
    await authStore.updateProfile(form)
    // Show success message
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('New passwords do not match')
    return
  }

  passwordLoading.value = true
  try {
    // Implement password change logic
    console.log('Changing password...')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    console.error('Failed to change password:', error)
  } finally {
    passwordLoading.value = false
  }
}

const updateNotifications = () => {
  // Implement notification settings update
  console.log('Updating notifications:', notifications)
}

const downloadData = () => {
  // Implement data download
  console.log('Downloading user data...')
}

const deleteAccount = async () => {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Failed to delete account:', error)
  }
}

onMounted(() => {
  // Populate form with current user data
  const user = authStore.user
  if (user) {
    form.firstName = user.firstName
    form.lastName = user.lastName
    form.email = user.email
    form.phone = user.phone || ''
    form.location = ''
    form.bio = ''
  }
})
</script>

<style scoped>
.profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.profile-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.profile-header p {
  color: var(--color-text);
  font-size: 1.125rem;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-summary {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.profile-avatar {
  width: 80px;
  height: 80px;
  background: var(--color-heading);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.profile-info h2 {
  color: var(--color-heading);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.profile-info p {
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.profile-role {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: var(--color-heading);
  color: white;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.profile-section {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 2rem;
}

.profile-section h3 {
  color: var(--color-heading);
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--color-heading);
  font-weight: 500;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-heading);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

textarea.form-input {
  resize: vertical;
  min-height: 100px;
}

.notification-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.notification-info h4 {
  color: var(--color-heading);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.notification-info p {
  color: var(--color-text);
  font-size: 0.875rem;
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
  background-color: var(--color-border);
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--color-heading);
}

.toggle input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.account-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--color-heading);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1a202c;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  border-color: var(--color-border);
  color: var(--color-text);
  background: transparent;
}

.btn-outline:hover {
  background: var(--color-background-soft);
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
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
  background: var(--color-background);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  border: 1px solid var(--color-border);
}

.modal h3 {
  color: var(--color-heading);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.modal p {
  color: var(--color-text);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .profile-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .notification-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .account-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
