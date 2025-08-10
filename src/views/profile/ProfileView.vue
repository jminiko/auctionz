<template>
  <div class="page-container">
    <div class="page-header">
      <h1>My Profile</h1>
      <p>Manage your account information and preferences</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your profile...</p>
    </div>

    <!-- Profile Content -->
    <div v-else>
      <!-- Profile Overview -->
      <div class="section">
        <div class="profile-avatar-section">
          <div class="avatar-container">
            <div v-if="user.avatar_url" class="avatar-image">
              <img :src="user.avatar_url" :alt="user.full_name" />
            </div>
            <div v-else class="avatar-placeholder">
              {{ getUserInitials() }}
            </div>
            <button @click="showAvatarUpload = true" class="avatar-upload-btn">📷</button>
          </div>
          <div class="avatar-info">
            <h2>{{ user.full_name }}</h2>
            <p class="user-role">{{ formatRole(user.role) }}</p>
            <p class="member-since">Member since {{ formatDate(user.created_at) }}</p>
          </div>
        </div>

        <!-- Profile Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <h3>{{ stats.total_auctions || stats.total_bids || stats.total_users || 0 }}</h3>
              <p>{{ getStatLabel() }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🟢</div>
            <div class="stat-content">
              <h3>{{ stats.active_auctions || stats.active_bids || 0 }}</h3>
              <p>Active</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>${{ (stats.total_revenue || stats.total_spent || 0).toLocaleString() }}</h3>
              <p>{{ user.role === 'buyer' ? 'Total Spent' : 'Total Revenue' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Sections -->
      <div>
        <!-- Personal Information -->
        <div class="section">
          <div class="section-header">
            <h3>Personal Information</h3>
            <button @click="editPersonalInfo = true" class="btn btn-outline">Edit</button>
          </div>
          <div class="section-content">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <span>{{ user.full_name }}</span>
              </div>
              <div class="form-group">
                <label>Email</label>
                <span>{{ user.email }}</span>
              </div>
              <div class="form-group">
                <label>Phone</label>
                <span>{{ user.phone || 'Not provided' }}</span>
              </div>
              <div class="form-group">
                <label>Location</label>
                <span>{{ user.location || 'Not provided' }}</span>
              </div>
              <div class="form-group full-width">
                <label>Bio</label>
                <span>{{ user.bio || 'No bio provided' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Security -->
        <div class="section">
          <div class="section-header">
            <h3>Account Security</h3>
            <button @click="showPasswordChange = true" class="btn btn-outline">
              Change Password
            </button>
          </div>
          <div class="section-content">
            <div class="security-items">
              <div class="security-item">
                <div class="security-icon">📧</div>
                <div class="security-info">
                  <h4>Email Verification</h4>
                  <p>{{ user.email_verified ? 'Verified' : 'Not verified' }}</p>
                </div>
                <div class="security-status" :class="{ verified: user.email_verified }">
                  {{ user.email_verified ? '✅' : '❌' }}
                </div>
              </div>
              <div class="security-item">
                <div class="security-icon">📱</div>
                <div class="security-info">
                  <h4>Phone Verification</h4>
                  <p>{{ user.phone_verified ? 'Verified' : 'Not verified' }}</p>
                </div>
                <div class="security-status" :class="{ verified: user.phone_verified }">
                  {{ user.phone_verified ? '✅' : '❌' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="section">
          <div class="section-header">
            <h3>Notification Settings</h3>
            <button @click="editNotifications = true" class="btn btn-outline">Edit</button>
          </div>
          <div class="section-content">
            <div class="notification-items">
              <div class="notification-item">
                <div class="notification-info">
                  <h4>Email Notifications</h4>
                  <p>Receive notifications via email</p>
                </div>
                <div class="notification-status">
                  {{ user.notification_email ? '✅' : '❌' }}
                </div>
              </div>
              <div class="notification-item">
                <div class="notification-info">
                  <h4>SMS Notifications</h4>
                  <p>Receive notifications via SMS</p>
                </div>
                <div class="notification-status">
                  {{ user.notification_sms ? '✅' : '❌' }}
                </div>
              </div>
              <div class="notification-item">
                <div class="notification-info">
                  <h4>Push Notifications</h4>
                  <p>Receive push notifications</p>
                </div>
                <div class="notification-status">
                  {{ user.notification_push ? '✅' : '❌' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="section">
          <div class="section-header">
            <h3>Recent Activity</h3>
            <router-link to="/dashboard" class="view-all">View All</router-link>
          </div>
          <div class="section-content">
            <div
              v-if="recentActivity.auctions && recentActivity.auctions.length > 0"
              class="activity-list"
            >
              <div
                v-for="auction in recentActivity.auctions"
                :key="auction.id"
                class="activity-item"
              >
                <div class="activity-icon">🏷️</div>
                <div class="activity-content">
                  <h4>{{ auction.title }}</h4>
                  <p>Created {{ formatDate(auction.created_at) }}</p>
                </div>
                <div class="status-badge" :class="auction.status">
                  {{ auction.status }}
                </div>
              </div>
            </div>
            <div
              v-else-if="recentActivity.bids && recentActivity.bids.length > 0"
              class="activity-list"
            >
              <div v-for="bid in recentActivity.bids" :key="bid.id" class="activity-item">
                <div class="activity-icon">💰</div>
                <div class="activity-content">
                  <h4>${{ bid.amount.toLocaleString() }}</h4>
                  <p>Bid on {{ bid.auction_title }}</p>
                </div>
                <div class="activity-time">{{ formatDate(bid.timestamp) }}</div>
              </div>
            </div>
            <div v-else class="empty-activity">
              <p>No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <PersonalInfoModal
      v-if="editPersonalInfo"
      :user="user"
      @close="editPersonalInfo = false"
      @updated="handleProfileUpdated"
    />

    <PasswordChangeModal
      v-if="showPasswordChange"
      @close="showPasswordChange = false"
      @updated="handlePasswordChanged"
    />

    <NotificationSettingsModal
      v-if="editNotifications"
      :settings="user"
      @close="editNotifications = false"
      @updated="handleSettingsUpdated"
    />

    <AvatarUploadModal
      v-if="showAvatarUpload"
      @close="showAvatarUpload = false"
      @updated="handleAvatarUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usersAPI } from '@/services/api'
import PersonalInfoModal from '@/components/profile/PersonalInfoModal.vue'
import PasswordChangeModal from '@/components/profile/PasswordChangeModal.vue'
import NotificationSettingsModal from '@/components/profile/NotificationSettingsModal.vue'
import AvatarUploadModal from '@/components/profile/AvatarUploadModal.vue'

const authStore = useAuthStore()
const loading = ref(true)
const editPersonalInfo = ref(false)
const showPasswordChange = ref(false)
const editNotifications = ref(false)
const showAvatarUpload = ref(false)

// Profile data
const user = ref<any>({})
const stats = ref<any>({})
const recentActivity = ref<any>({})

const getUserInitials = () => {
  const firstName = user.value.first_name || ''
  const lastName = user.value.last_name || ''
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase()
}

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getStatLabel = () => {
  if (user.value.role === 'seller') return 'Total Auctions'
  if (user.value.role === 'buyer') return 'Total Bids'
  if (user.value.role === 'admin') return 'Total Users'
  return 'Total'
}

const loadProfile = async () => {
  try {
    loading.value = true

    // Load user profile
    const profileResponse = await usersAPI.getCurrentProfile()
    user.value = profileResponse.data.user

    // Load profile stats
    const statsResponse = await usersAPI.getProfileStats()
    stats.value = statsResponse.data.stats
    recentActivity.value = statsResponse.data.recent_activity
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
}

const handleProfileUpdated = async () => {
  editPersonalInfo.value = false
  await loadProfile()
  // Update auth store user data
  if (authStore.user) {
    authStore.user = { ...authStore.user, ...user.value }
  }
}

const handlePasswordChanged = () => {
  showPasswordChange.value = false
  // Could show a success message here
}

const handleSettingsUpdated = async () => {
  editNotifications.value = false
  await loadProfile()
}

const handleAvatarUpdated = async () => {
  showAvatarUpload.value = false
  await loadProfile()
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
/* Profile-specific styles that extend the global system */

.profile-avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.avatar-container {
  position: relative;
}

.avatar-image img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.avatar-upload-btn:hover {
  background: var(--color-primary-hover);
  transform: scale(1.1);
}

.avatar-info h2 {
  font-size: 1.5rem;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.user-role {
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.member-since {
  color: var(--color-text);
  font-size: 0.875rem;
}

.security-items,
.notification-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item,
.notification-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.security-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  border-radius: 8px;
}

.security-info,
.notification-info {
  flex: 1;
}

.security-info h4,
.notification-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.25rem 0;
}

.security-info p,
.notification-info p {
  color: var(--color-text);
  font-size: 0.875rem;
  margin: 0;
}

.security-status,
.notification-status {
  font-size: 1.25rem;
}

.security-status.verified {
  color: var(--color-success);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  transition: transform 0.2s ease;
}

.activity-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white);
  border-radius: 8px;
}

.activity-content {
  flex: 1;
}

.activity-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0 0 0.25rem 0;
}

.activity-content p {
  color: var(--color-text);
  font-size: 0.875rem;
  margin: 0;
}

.activity-time {
  color: var(--color-text);
  font-size: 0.875rem;
}

.empty-activity {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
}

.view-all {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  color: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .profile-avatar-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
