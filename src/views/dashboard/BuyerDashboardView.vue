<template>
  <div class="buyer-dashboard">
    <div class="dashboard-header">
      <h1>Buyer Dashboard</h1>
      <p>Welcome back, {{ authStore.user?.firstName }}! Here's your bidding activity.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.activeBids }}</div>
          <div class="stat-label">Active Bids</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.wonAuctions }}</div>
          <div class="stat-label">Won Auctions</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.watchlist }}</div>
          <div class="stat-label">Watchlist</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-number">${{ stats.totalSpent.toLocaleString() }}</div>
          <div class="stat-label">Total Spent</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <router-link to="/auctions" class="action-card">
        <div class="action-icon">🔍</div>
        <div class="action-content">
          <h3>Browse Auctions</h3>
          <p>Find new items to bid on</p>
        </div>
      </router-link>
      <router-link to="/my-bids" class="action-card">
        <div class="action-icon">📋</div>
        <div class="action-content">
          <h3>My Bids</h3>
          <p>View your bidding history</p>
        </div>
      </router-link>
      <router-link to="/profile" class="action-card">
        <div class="action-icon">👤</div>
        <div class="action-content">
          <h3>Profile</h3>
          <p>Update your account settings</p>
        </div>
      </router-link>
    </div>

    <!-- Active Bids Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Your Active Bids</h2>
        <router-link to="/my-bids" class="view-all">View All</router-link>
      </div>
      
      <div v-if="activeBids.length === 0" class="empty-state">
        <div class="empty-icon">🏷️</div>
        <h3>No Active Bids</h3>
        <p>Start bidding on auctions to see them here</p>
        <router-link to="/auctions" class="btn btn-primary">Browse Auctions</router-link>
      </div>
      
      <div v-else class="bids-grid">
        <div v-for="bid in activeBids" :key="bid.id" class="bid-card">
          <div class="bid-image">
            <img :src="getAuctionImage(bid.auctionId)" :alt="bid.auctionTitle" />
            <div class="bid-status" :class="getBidStatus(bid)">
              {{ getBidStatusText(bid) }}
            </div>
          </div>
          <div class="bid-content">
            <h3 class="bid-title">{{ bid.auctionTitle }}</h3>
            <div class="bid-details">
              <div class="bid-amount">
                <span class="label">Your Bid:</span>
                <span class="amount">${{ bid.amount.toLocaleString() }}</span>
              </div>
              <div class="current-price">
                <span class="label">Current Price:</span>
                <span class="amount">${{ getCurrentPrice(bid.auctionId).toLocaleString() }}</span>
              </div>
              <div class="bid-time">
                <span class="label">Bid Time:</span>
                <span class="time">{{ formatDate(bid.timestamp) }}</span>
              </div>
            </div>
            <div class="bid-actions">
              <router-link :to="`/auctions/${bid.auctionId}`" class="btn btn-primary">
                View Auction
              </router-link>
              <button class="btn btn-outline" @click="placeNewBid(bid.auctionId)">
                Bid Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recommended Auctions -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recommended for You</h2>
        <router-link to="/auctions" class="view-all">View All</router-link>
      </div>
      
      <div class="recommendations-grid">
        <div v-for="auction in recommendedAuctions" :key="auction.id" class="auction-card">
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
            <p class="auction-description">
              {{ auction.description.substring(0, 80) }}...
            </p>
            <div class="auction-meta">
              <div class="auction-price">
                <span class="current-price">${{ auction.currentPrice.toLocaleString() }}</span>
                <span class="bid-count">{{ auction.totalBids }} bids</span>
              </div>
              <div class="auction-time">
                <span class="time-left">Ends in {{ formatTimeLeft(auction.endDate) }}</span>
              </div>
            </div>
            <div class="auction-actions">
              <router-link :to="`/auctions/${auction.id}`" class="btn btn-primary">
                View Auction
              </router-link>
              <button class="btn btn-outline">Watch</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
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
          <div class="activity-amount" v-if="activity.amount">
            ${{ activity.amount.toLocaleString() }}
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

const authStore = useAuthStore()
const auctionStore = useAuctionStore()

// Mock data for demonstration
const stats = ref({
  activeBids: 5,
  wonAuctions: 12,
  watchlist: 8,
  totalSpent: 2450
})

const activeBids = ref([
  {
    id: '1',
    auctionId: '1',
    auctionTitle: 'Vintage Watch Collection',
    amount: 1500,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'leading'
  },
  {
    id: '2',
    auctionId: '2',
    auctionTitle: 'Antique Furniture Set',
    amount: 800,
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'outbid'
  }
])

const recommendedAuctions = ref<Auction[]>([])
const recentActivity = ref([
  {
    id: 1,
    type: 'bid',
    title: 'Placed bid on Vintage Watch Collection',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    amount: 1500
  },
  {
    id: 2,
    type: 'won',
    title: 'Won auction: Antique Vase',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    amount: 750
  },
  {
    id: 3,
    type: 'watch',
    title: 'Added to watchlist: Modern Art Piece',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
])

const getAuctionImage = (auctionId: string) => {
  const auction = auctionStore.auctions.find(a => a.id === auctionId)
  return auction?.images[0] || 'https://picsum.photos/300/200'
}

const getCurrentPrice = (auctionId: string) => {
  const auction = auctionStore.auctions.find(a => a.id === auctionId)
  return auction?.currentPrice || 0
}

const getBidStatus = (bid: any) => {
  return bid.status === 'leading' ? 'leading' : 'outbid'
}

const getBidStatusText = (bid: any) => {
  return bid.status === 'leading' ? 'Leading' : 'Outbid'
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

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'bid': return '🏷️'
    case 'won': return '🏆'
    case 'watch': return '👁️'
    default: return '📝'
  }
}

const placeNewBid = (auctionId: string) => {
  // This would open a bidding modal or navigate to auction detail
  console.log('Place new bid for auction:', auctionId)
}

onMounted(async () => {
  try {
    await auctionStore.fetchAuctions()
    recommendedAuctions.value = auctionStore.activeAuctions.slice(0, 4)
  } catch (error) {
    console.error('Failed to load auctions:', error)
  }
})
</script>

<style scoped>
.buyer-dashboard {
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
  transition: transform 0.2s, box-shadow 0.2s;
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
  transition: transform 0.2s, box-shadow 0.2s;
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

.bids-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.bid-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.bid-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.bid-image {
  position: relative;
  height: 150px;
  overflow: hidden;
}

.bid-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bid-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.bid-status.leading {
  background: #dcfce7;
  color: #166534;
}

.bid-status.outbid {
  background: #fef2f2;
  color: #dc2626;
}

.bid-content {
  padding: 1.5rem;
}

.bid-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.bid-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.bid-amount,
.current-price,
.bid-time {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.bid-amount .label,
.current-price .label,
.bid-time .label {
  color: var(--color-text);
}

.bid-amount .amount,
.current-price .amount {
  color: var(--color-heading);
  font-weight: 600;
}

.bid-time .time {
  color: var(--color-text);
}

.bid-actions {
  display: flex;
  gap: 0.5rem;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.auction-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.auction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.auction-image {
  position: relative;
  height: 180px;
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

.auction-description {
  color: var(--color-text);
  margin: 0.5rem 0 1rem;
  line-height: 1.5;
  font-size: 0.875rem;
}

.auction-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-price {
  font-size: 1.125rem;
  font-weight: bold;
  color: var(--color-heading);
}

.bid-count {
  font-size: 0.875rem;
  color: var(--color-text);
  margin-left: 0.5rem;
}

.time-left {
  font-size: 0.875rem;
  color: var(--color-text);
}

.auction-actions {
  display: flex;
  gap: 0.5rem;
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

.activity-amount {
  color: var(--color-heading);
  font-weight: 600;
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
  
  .bids-grid {
    grid-template-columns: 1fr;
  }
  
  .recommendations-grid {
    grid-template-columns: 1fr;
  }
  
  .bid-actions,
  .auction-actions {
    flex-direction: column;
  }
}
</style>
