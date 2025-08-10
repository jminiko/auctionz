<template>
  <div class="admin-dashboard">
    <!-- Session Navigation -->
    <SessionNavigation />

    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <p>Platform overview and management tools</p>
    </div>

    <!-- Platform Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
          <div class="stat-change positive">+{{ stats.userGrowth }}% this month</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.activeAuctions }}</div>
          <div class="stat-label">Active Auctions</div>
          <div class="stat-change positive">+{{ stats.auctionGrowth }}% this week</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pendingApprovals }}</div>
          <div class="stat-label">Pending Approvals</div>
          <div class="stat-change neutral">No change</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-number">${{ stats.totalValue.toLocaleString() }}</div>
          <div class="stat-label">Total Value</div>
          <div class="stat-change positive">+{{ stats.valueGrowth }}% this month</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <router-link to="/admin/users" class="action-card">
        <div class="action-icon">👥</div>
        <div class="action-content">
          <h3>Manage Users</h3>
          <p>View and manage user accounts</p>
        </div>
      </router-link>
      <router-link to="/admin/auctions" class="action-card">
        <div class="action-icon">🏷️</div>
        <div class="action-content">
          <h3>Manage Auctions</h3>
          <p>Review and approve auctions</p>
        </div>
      </router-link>
      <router-link to="/admin/reports" class="action-card">
        <div class="action-icon">📊</div>
        <div class="action-content">
          <h3>Reports</h3>
          <p>View platform analytics</p>
        </div>
      </router-link>
      <router-link to="/admin/settings" class="action-card">
        <div class="action-icon">⚙️</div>
        <div class="action-content">
          <h3>Settings</h3>
          <p>Platform configuration</p>
        </div>
      </router-link>
    </div>

    <!-- Recent Users -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recent Users</h2>
        <router-link to="/admin/users" class="view-all">View All Users</router-link>
      </div>

      <div class="users-list">
        <div v-for="user in recentUsers" :key="user.id" class="user-item">
          <div class="user-avatar">
            {{ getUserInitials(user) }}
          </div>
          <div class="user-content">
            <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
            <div class="user-email">{{ user.email }}</div>
            <div class="user-role">{{ user.role }}</div>
          </div>
          <div class="user-status" :class="user.status">
            {{ user.status }}
          </div>
          <div class="user-actions">
            <button class="btn btn-outline" @click="viewUser(user.id)">View</button>
            <button
              v-if="user.status === 'active'"
              class="btn btn-danger"
              @click="suspendUser(user.id)"
            >
              Suspend
            </button>
            <button v-else class="btn btn-primary" @click="activateUser(user.id)">Activate</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Auctions -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recent Auctions</h2>
        <router-link to="/admin/auctions" class="view-all">View All Auctions</router-link>
      </div>

      <div class="auctions-list">
        <div v-for="auction in recentAuctions" :key="auction.id" class="auction-item">
          <div class="auction-image">
            <img :src="auction.images[0]" :alt="auction.title" />
          </div>
          <div class="auction-content">
            <div class="auction-title">{{ auction.title }}</div>
            <div class="auction-seller">by {{ auction.sellerName }}</div>
            <div class="auction-price">${{ auction.currentPrice.toLocaleString() }}</div>
          </div>
          <div class="auction-status" :class="auction.status">
            {{ auction.status }}
          </div>
          <div class="auction-actions">
            <router-link :to="`/auctions/${auction.id}`" class="btn btn-outline">
              View
            </router-link>
            <button
              v-if="auction.status === 'pending'"
              class="btn btn-primary"
              @click="approveAuction(auction.id)"
            >
              Approve
            </button>
            <button
              v-if="auction.status === 'active'"
              class="btn btn-danger"
              @click="suspendAuction(auction.id)"
            >
              Suspend
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- System Health -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>System Health</h2>
      </div>

      <div class="health-grid">
        <div class="health-card">
          <div class="health-icon">🟢</div>
          <div class="health-content">
            <div class="health-title">Server Status</div>
            <div class="health-value">Online</div>
            <div class="health-details">99.9% uptime</div>
          </div>
        </div>
        <div class="health-card">
          <div class="health-icon">🟢</div>
          <div class="health-content">
            <div class="health-title">Database</div>
            <div class="health-value">Healthy</div>
            <div class="health-details">Response time: 45ms</div>
          </div>
        </div>
        <div class="health-card">
          <div class="health-icon">🟡</div>
          <div class="health-content">
            <div class="health-title">Storage</div>
            <div class="health-value">75% Used</div>
            <div class="health-details">2.5GB / 10GB</div>
          </div>
        </div>
        <div class="health-card">
          <div class="health-icon">🟢</div>
          <div class="health-content">
            <div class="health-title">Security</div>
            <div class="health-value">Protected</div>
            <div class="health-details">No threats detected</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Platform Activity -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recent Activity</h2>
      </div>

      <div class="activity-list">
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            {{ getActivityIcon(activity.type) }}
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-time">{{ formatDate(activity.timestamp) }}</div>
          </div>
          <div class="activity-user" v-if="activity.user">
            {{ activity.user }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAuctionStore, type Auction } from '@/stores/auction'
import { useDashboardStore } from '@/stores/dashboard'
import SessionNavigation from '@/components/SessionNavigation.vue'

const authStore = useAuthStore()
const auctionStore = useAuctionStore()
const dashboardStore = useDashboardStore()

// Real data from API
const stats = ref({
  totalUsers: 0,
  userGrowth: 0,
  activeAuctions: 0,
  auctionGrowth: 0,
  pendingApprovals: 0,
  totalValue: 0,
  valueGrowth: 0,
})

const recentUsers = ref<any[]>([])

const recentAuctions = ref<Auction[]>([])
const recentActivity = ref<any[]>([])

const getUserInitials = (user: any) => {
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
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

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'user':
      return '👤'
    case 'auction':
      return '🏷️'
    case 'bid':
      return '💰'
    case 'system':
      return '⚙️'
    default:
      return '📝'
  }
}

const viewUser = (userId: number) => {
  console.log('View user:', userId)
}

const suspendUser = (userId: number) => {
  console.log('Suspend user:', userId)
}

const activateUser = (userId: number) => {
  console.log('Activate user:', userId)
}

const approveAuction = (auctionId: string) => {
  console.log('Approve auction:', auctionId)
}

const suspendAuction = (auctionId: string) => {
  console.log('Suspend auction:', auctionId)
}

onMounted(async () => {
  try {
    // Load admin dashboard data
    const adminData = await dashboardStore.fetchAdminDashboard()

    // Update stats with real data
    stats.value = {
      totalUsers: adminData.platform_stats.total_users,
      userGrowth: 12.5, // This would come from analytics API
      activeAuctions: adminData.platform_stats.active_auctions,
      auctionGrowth: 8.3, // This would come from analytics API
      pendingApprovals: adminData.platform_stats.pending_auctions,
      totalValue: adminData.platform_stats.total_value,
      valueGrowth: 15.2, // This would come from analytics API
    }

    // Update recent users and auctions
    recentUsers.value = adminData.recent_users
    recentAuctions.value = adminData.recent_auctions

    // Load recent activity
    await dashboardStore.fetchRecentActivity()
    recentActivity.value = dashboardStore.recentActivity
  } catch (error) {
    console.error('Failed to load admin dashboard:', error)
  }
})
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: #7f8c8d;
  font-size: 1.125rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 1rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.875rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #166534;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-change.neutral {
  color: var(--color-text);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 0.75rem;
}

.action-content h3 {
  color: #2c3e50;
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.action-content p {
  color: #7f8c8d;
  font-size: 0.875rem;
}

.dashboard-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.view-all {
  color: #3498db;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  color: #2980b9;
}

.users-list,
.auctions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item,
.auction-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 1.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  align-items: center;
}

.user-avatar {
  width: 50px;
  height: 50px;
  background: var(--color-heading);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
}

.user-content {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.user-email {
  color: var(--color-text);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.user-role {
  color: var(--color-text);
  font-size: 0.75rem;
  text-transform: capitalize;
}

.user-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.user-status.active {
  background: #dcfce7;
  color: #166534;
}

.user-status.suspended {
  background: #fef2f2;
  color: #dc2626;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
}

.auction-image {
  width: 60px;
  height: 60px;
  overflow: hidden;
  border-radius: 0.5rem;
}

.auction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-content {
  flex: 1;
}

.auction-title {
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.auction-seller {
  color: var(--color-text);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.auction-price {
  color: var(--color-heading);
  font-weight: 600;
  font-size: 0.875rem;
}

.auction-status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.auction-status.active {
  background: #dcfce7;
  color: #166534;
}

.auction-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.auction-status.ended {
  background: #fef2f2;
  color: #dc2626;
}

.auction-actions {
  display: flex;
  gap: 0.5rem;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.health-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.health-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 0.75rem;
}

.health-content {
  flex: 1;
}

.health-title {
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.health-value {
  color: var(--color-heading);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.health-details {
  color: var(--color-text);
  font-size: 0.75rem;
}

.activity-list {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  font-size: 1.25rem;
}

.activity-content {
  flex: 1;
}

.activity-title {
  color: var(--color-heading);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.activity-time {
  color: var(--color-text);
  font-size: 0.875rem;
}

.activity-user {
  color: var(--color-text);
  font-size: 0.875rem;
  font-style: italic;
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

.btn-primary {
  background: var(--color-heading);
  color: white;
}

.btn-primary:hover {
  background: #1a202c;
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .user-item,
  .auction-item {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1rem;
  }

  .user-actions,
  .auction-actions {
    justify-content: center;
  }

  .health-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
}
</style>
