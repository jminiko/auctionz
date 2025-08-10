<template>
  <div class="seller-dashboard">
    <!-- Session Navigation -->
    <SessionNavigation />

    <div class="dashboard-header">
      <h1>Seller Dashboard</h1>
      <p>
        Welcome back, {{ authStore.user?.first_name }}! Manage your auctions and track your sales.
      </p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.activeAuctions }}</div>
          <div class="stat-label">Active Auctions</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-number">${{ stats.totalSales.toLocaleString() }}</div>
          <div class="stat-label">Total Sales</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.completedSales }}</div>
          <div class="stat-label">Completed Sales</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.rating }}</div>
          <div class="stat-label">Seller Rating</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <router-link to="/create-auction" class="action-card">
        <div class="action-icon">➕</div>
        <div class="action-content">
          <h3>Create Auction</h3>
          <p>List a new item for auction</p>
        </div>
      </router-link>
      <router-link to="/my-auctions" class="action-card">
        <div class="action-icon">📋</div>
        <div class="action-content">
          <h3>My Auctions</h3>
          <p>Manage your active listings</p>
        </div>
      </router-link>
      <router-link to="/profile" class="action-card">
        <div class="action-icon">👤</div>
        <div class="action-content">
          <h3>Profile</h3>
          <p>Update your seller profile</p>
        </div>
      </router-link>
    </div>

    <!-- Active Auctions Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Your Active Auctions</h2>
        <router-link to="/my-auctions" class="view-all">View All</router-link>
      </div>

      <div v-if="myAuctions.length === 0" class="empty-state">
        <div class="empty-icon">🏷️</div>
        <h3>No Active Auctions</h3>
        <p>Create your first auction to start selling</p>
        <router-link to="/create-auction" class="btn btn-primary">Create Auction</router-link>
      </div>

      <div v-else class="auctions-grid">
        <div v-for="auction in myAuctions" :key="auction.id" class="auction-card">
          <div class="auction-image">
            <img :src="auction.images[0]" :alt="auction.title" />
            <div class="auction-status" :class="auction.status">
              {{ auction.status }}
            </div>
          </div>
          <div class="auction-content">
            <h3 class="auction-title">
              <router-link :to="`/auctions/${auction.id}`">
                {{ auction.title }}
              </router-link>
            </h3>
            <div class="auction-stats">
              <div class="stat-item">
                <span class="label">Current Price:</span>
                <span class="value">${{ auction.currentPrice }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Total Bids:</span>
                <span class="value">{{ auction.totalBids }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Views:</span>
                <span class="value">{{ auction.views }}</span>
              </div>
              <div class="stat-item">
                <span class="label">Watchers:</span>
                <span class="value">{{ auction.watchers }}</span>
              </div>
            </div>
            <div class="auction-time">
              <span class="time-left">Ends in {{ formatTimeLeft(auction.endDate) }}</span>
            </div>
            <div class="auction-actions">
              <router-link :to="`/auctions/${auction.id}`" class="btn btn-primary">
                View Auction
              </router-link>
              <button class="btn btn-outline" @click="editAuction(auction.id)">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Sales -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recent Sales</h2>
      </div>

      <div v-if="recentSales.length === 0" class="empty-state">
        <div class="empty-icon">💰</div>
        <h3>No Recent Sales</h3>
        <p>Your completed sales will appear here</p>
      </div>

      <div v-else class="sales-list">
        <div v-for="sale in recentSales" :key="sale.id" class="sale-item">
          <div class="sale-image">
            <img :src="sale.image" :alt="sale.title" />
          </div>
          <div class="sale-content">
            <h3 class="sale-title">{{ sale.title }}</h3>
            <div class="sale-details">
              <div class="sale-price">
                <span class="label">Sold for:</span>
                <span class="amount">${{ sale.finalPrice.toLocaleString() }}</span>
              </div>
              <div class="sale-buyer">
                <span class="label">Buyer:</span>
                <span class="buyer">{{ sale.buyerName }}</span>
              </div>
              <div class="sale-date">
                <span class="label">Sold on:</span>
                <span class="date">{{ formatDate(sale.soldDate) }}</span>
              </div>
            </div>
          </div>
          <div class="sale-actions">
            <button class="btn btn-outline" @click="contactBuyer(sale.buyerId)">
              Contact Buyer
            </button>
            <button class="btn btn-primary" @click="markShipped(sale.id)">Mark Shipped</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Analytics -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Sales Analytics</h2>
        <div class="time-filter">
          <button
            v-for="period in timePeriods"
            :key="period.value"
            @click="selectedPeriod = period.value"
            :class="['period-btn', { active: selectedPeriod === period.value }]"
          >
            {{ period.label }}
          </button>
        </div>
      </div>

      <div class="analytics-grid">
        <div class="analytics-card">
          <h3>Revenue</h3>
          <div class="analytics-value">${{ analytics.revenue.toLocaleString() }}</div>
          <div
            class="analytics-change"
            :class="analytics.revenueChange >= 0 ? 'positive' : 'negative'"
          >
            {{ analytics.revenueChange >= 0 ? '+' : '' }}{{ analytics.revenueChange }}%
          </div>
        </div>
        <div class="analytics-card">
          <h3>Items Sold</h3>
          <div class="analytics-value">{{ analytics.itemsSold }}</div>
          <div
            class="analytics-change"
            :class="analytics.itemsSoldChange >= 0 ? 'positive' : 'negative'"
          >
            {{ analytics.itemsSoldChange >= 0 ? '+' : '' }}{{ analytics.itemsSoldChange }}%
          </div>
        </div>
        <div class="analytics-card">
          <h3>Average Price</h3>
          <div class="analytics-value">${{ analytics.averagePrice.toLocaleString() }}</div>
          <div
            class="analytics-change"
            :class="analytics.averagePriceChange >= 0 ? 'positive' : 'negative'"
          >
            {{ analytics.averagePriceChange >= 0 ? '+' : '' }}{{ analytics.averagePriceChange }}%
          </div>
        </div>
        <div class="analytics-card">
          <h3>Success Rate</h3>
          <div class="analytics-value">{{ analytics.successRate }}%</div>
          <div
            class="analytics-change"
            :class="analytics.successRateChange >= 0 ? 'positive' : 'negative'"
          >
            {{ analytics.successRateChange >= 0 ? '+' : '' }}{{ analytics.successRateChange }}%
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAuctionStore, type Auction } from '@/stores/auction'
import { useDashboardStore } from '@/stores/dashboard'
import SessionNavigation from '@/components/SessionNavigation.vue'

const authStore = useAuthStore()
const auctionStore = useAuctionStore()
const dashboardStore = useDashboardStore()

// Real data from API
const stats = ref({
  activeAuctions: 0,
  totalSales: 0,
  completedSales: 0,
  rating: 0,
})

const myAuctions = ref<Auction[]>([])
const recentSales = ref([
  {
    id: 1,
    title: 'Vintage Watch Collection',
    finalPrice: 2500,
    buyerName: 'John Smith',
    buyerId: 1,
    soldDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image: 'https://picsum.photos/100/100?random=1',
  },
  {
    id: 2,
    title: 'Antique Furniture Set',
    finalPrice: 1800,
    buyerName: 'Sarah Johnson',
    buyerId: 2,
    soldDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    image: 'https://picsum.photos/100/100?random=2',
  },
])

const selectedPeriod = ref('30d')
const timePeriods = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '1Y', value: '1y' },
]

const analytics = ref({
  revenue: 0,
  revenueChange: 0,
  itemsSold: 0,
  itemsSoldChange: 0,
  averagePrice: 0,
  averagePriceChange: 0,
  successRate: 0,
  successRateChange: 0,
})

const formatTimeLeft = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return 'Less than 1h'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const editAuction = (auctionId: string) => {
  // This would navigate to edit auction page
  console.log('Edit auction:', auctionId)
}

const contactBuyer = (buyerId: number) => {
  // This would open contact modal or navigate to messaging
  console.log('Contact buyer:', buyerId)
}

const markShipped = (saleId: number) => {
  // This would mark the item as shipped
  console.log('Mark shipped:', saleId)
}

onMounted(async () => {
  try {
    // Load dashboard statistics
    const dashboardStats = await dashboardStore.fetchDashboardStats()

    // Update stats with real data
    stats.value = {
      activeAuctions: dashboardStats.active_auctions || 0,
      totalSales: dashboardStats.total_sales || 0,
      completedSales: dashboardStats.completed_auctions || 0,
      rating: 4.8, // This would come from a ratings API
    }

    // Load seller analytics
    const sellerAnalytics = await dashboardStore.fetchSellerAnalytics()

    // Update analytics with real data
    analytics.value = {
      revenue: sellerAnalytics.total_sales,
      revenueChange: 12.5, // This would come from comparison with previous period
      itemsSold: sellerAnalytics.completed_auctions,
      itemsSoldChange: 20, // This would come from comparison with previous period
      averagePrice: sellerAnalytics.average_sale_price,
      averagePriceChange: -5.2, // This would come from comparison with previous period
      successRate: sellerAnalytics.success_rate,
      successRateChange: 8.3, // This would come from comparison with previous period
    }

    // Update recent sales with real data
    recentSales.value = sellerAnalytics.sold_auctions.map((auction: any) => ({
      id: auction.id,
      title: auction.title,
      finalPrice: auction.current_price,
      buyerName: auction.winner_name || 'Unknown',
      buyerId: auction.winner_id,
      soldDate: auction.updated_at,
      image: auction.images?.[0] || 'https://picsum.photos/100/100',
    }))

    // Load user's auctions
    await auctionStore.fetchAuctions()
    myAuctions.value = auctionStore.myAuctions.slice(0, 6)
  } catch (error) {
    console.error('Failed to load seller dashboard:', error)
  }
})
</script>

<style scoped>
.seller-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  color: var(--color-text);
  font-size: 1.125rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--color-text);
  font-size: 0.875rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.action-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
  color: var(--color-heading);
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.action-content p {
  color: var(--color-text);
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
  color: var(--color-heading);
}

.view-all {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  color: #1a202c;
}

.time-filter {
  display: flex;
  gap: 0.5rem;
}

.period-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.period-btn.active {
  background: var(--color-heading);
  color: white;
  border-color: var(--color-heading);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--color-background-soft);
  border-radius: 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--color-heading);
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.auction-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.auction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.auction-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.auction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
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

.auction-status.ended {
  background: #fef2f2;
  color: #dc2626;
}

.auction-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.auction-content {
  padding: 1.5rem;
}

.auction-title a {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
}

.auction-title a:hover {
  color: #1a202c;
}

.auction-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.stat-item .label {
  color: var(--color-text);
}

.stat-item .value {
  color: var(--color-heading);
  font-weight: 600;
}

.auction-time {
  margin-bottom: 1rem;
}

.time-left {
  font-size: 0.875rem;
  color: var(--color-text);
}

.auction-actions {
  display: flex;
  gap: 0.5rem;
}

.sales-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sale-item {
  display: grid;
  grid-template-columns: 80px 1fr auto;
  gap: 1.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  align-items: center;
}

.sale-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 0.5rem;
}

.sale-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sale-content {
  flex: 1;
}

.sale-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.sale-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sale-price,
.sale-buyer,
.sale-date {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.sale-price .label,
.sale-buyer .label,
.sale-date .label {
  color: var(--color-text);
}

.sale-price .amount {
  color: var(--color-heading);
  font-weight: 600;
}

.sale-buyer .buyer,
.sale-date .date {
  color: var(--color-heading);
}

.sale-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.analytics-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
}

.analytics-card h3 {
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.analytics-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.analytics-change {
  font-size: 0.875rem;
  font-weight: 500;
}

.analytics-change.positive {
  color: #166534;
}

.analytics-change.negative {
  color: #dc2626;
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .auctions-grid {
    grid-template-columns: 1fr;
  }

  .sale-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .sale-actions {
    flex-direction: row;
    justify-content: center;
  }

  .analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .time-filter {
    justify-content: center;
  }
}
</style>
