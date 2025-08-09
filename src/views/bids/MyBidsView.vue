<template>
  <div class="my-bids">
    <div class="my-bids-header">
      <div class="header-content">
        <h1>My Bids</h1>
        <p>Track your bidding activity and manage your auction participation</p>
      </div>
      <router-link to="/auctions" class="btn btn-primary">
        Browse Auctions
      </router-link>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <h3>{{ stats.totalBids }}</h3>
          <p>Total Bids</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🟢</div>
        <div class="stat-content">
          <h3>{{ stats.activeBids }}</h3>
          <p>Active Bids</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <h3>{{ stats.wonAuctions }}</h3>
          <p>Won Auctions</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>${{ stats.totalSpent.toLocaleString() }}</h3>
          <p>Total Spent</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-box">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Search auctions..."
          class="search-input"
        />
        <span class="search-icon">🔍</span>
      </div>

      <div class="filter-controls">
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="winning">Winning</option>
          <option value="outbid">Outbid</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </select>

        <select v-model="filters.sortBy" class="filter-select">
          <option value="recent">Most Recent</option>
          <option value="ending">Ending Soon</option>
          <option value="amount">Bid Amount</option>
          <option value="auction">Auction Name</option>
        </select>

        <button @click="clearFilters" class="btn btn-outline">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Bids List -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your bids...</p>
    </div>

    <div v-else-if="filteredBids.length === 0" class="empty-state">
      <div class="empty-icon">🎯</div>
      <h3>No bids found</h3>
      <p>{{ filters.search || filters.status ? 'Try adjusting your filters' : 'Start bidding on auctions to see them here' }}</p>
      <router-link v-if="!filters.search && !filters.status" to="/auctions" class="btn btn-primary">
        Browse Auctions
      </router-link>
    </div>

    <div v-else class="bids-list">
      <div
        v-for="bid in filteredBids"
        :key="bid.id"
        class="bid-card"
      >
        <div class="bid-image">
          <img :src="bid.auction.images[0] || '/placeholder-image.jpg'" :alt="bid.auction.title" />
          <div class="bid-status" :class="getBidStatus(bid)">
            {{ getBidStatusText(bid) }}
          </div>
        </div>

        <div class="bid-content">
          <div class="bid-header">
            <h3 class="auction-title">{{ bid.auction.title }}</h3>
            <div class="bid-amount">
              <span class="amount-label">Your Bid:</span>
              <span class="amount-value">${{ bid.amount.toLocaleString() }}</span>
            </div>
          </div>

          <div class="auction-details">
            <div class="detail-row">
              <span class="detail-label">Current Price:</span>
              <span class="detail-value">${{ bid.auction.currentPrice.toLocaleString() }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Bids:</span>
              <span class="detail-value">{{ bid.auction.bidCount }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Ends:</span>
              <span class="detail-value">{{ formatTimeLeft(bid.auction.endDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bid Placed:</span>
              <span class="detail-value">{{ formatDate(bid.createdAt) }}</span>
            </div>
          </div>

          <div class="bid-actions">
            <router-link :to="`/auctions/${bid.auction.id}`" class="btn btn-outline btn-sm">
              View Auction
            </router-link>
            <button 
              v-if="isActiveBid(bid)" 
              @click="placeNewBid(bid.auction)" 
              class="btn btn-primary btn-sm"
            >
              Place New Bid
            </button>
            <button 
              v-if="bid.status === 'won'" 
              @click="contactSeller(bid.auction)" 
              class="btn btn-outline btn-sm"
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        Previous
      </button>
      
      <div class="page-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          @click="currentPage = page"
          :class="['page-btn', { active: currentPage === page }]"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuctionStore } from '@/stores/auction'

const router = useRouter()
const auctionStore = useAuctionStore()

const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

const filters = reactive({
  search: '',
  status: '',
  sortBy: 'recent'
})

// Mock bid data - in a real app, this would come from the store
const mockBids = [
  {
    id: '1',
    amount: 1500,
    createdAt: '2024-01-15T10:30:00Z',
    status: 'winning',
    auction: {
      id: '1',
      title: 'Vintage Rolex Submariner',
      currentPrice: 1500,
      bidCount: 12,
      endDate: '2024-01-20T18:00:00Z',
      images: ['/watch1.jpg'],
      status: 'active'
    }
  },
  {
    id: '2',
    amount: 800,
    createdAt: '2024-01-14T15:45:00Z',
    status: 'outbid',
    auction: {
      id: '2',
      title: 'Antique Persian Rug',
      currentPrice: 850,
      bidCount: 8,
      endDate: '2024-01-18T20:00:00Z',
      images: ['/rug1.jpg'],
      status: 'active'
    }
  },
  {
    id: '3',
    amount: 2500,
    createdAt: '2024-01-10T09:15:00Z',
    status: 'won',
    auction: {
      id: '3',
      title: 'Limited Edition Comic Book Collection',
      currentPrice: 2500,
      bidCount: 25,
      endDate: '2024-01-12T16:00:00Z',
      images: ['/comics1.jpg'],
      status: 'completed'
    }
  },
  {
    id: '4',
    amount: 1200,
    createdAt: '2024-01-08T14:20:00Z',
    status: 'lost',
    auction: {
      id: '4',
      title: 'Gaming PC Setup',
      currentPrice: 1300,
      bidCount: 15,
      endDate: '2024-01-09T22:00:00Z',
      images: ['/pc1.jpg'],
      status: 'completed'
    }
  }
]

const stats = computed(() => {
  const bids = mockBids
  return {
    totalBids: bids.length,
    activeBids: bids.filter(b => isActiveBid(b)).length,
    wonAuctions: bids.filter(b => b.status === 'won').length,
    totalSpent: bids
      .filter(b => b.status === 'won')
      .reduce((sum, b) => sum + b.amount, 0)
  }
})

const filteredBids = computed(() => {
  let filtered = mockBids

  if (filters.search) {
    filtered = filtered.filter(bid =>
      bid.auction.title.toLowerCase().includes(filters.search.toLowerCase())
    )
  }

  if (filters.status) {
    filtered = filtered.filter(bid => getBidStatus(bid) === filters.status)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'ending':
        return new Date(a.auction.endDate).getTime() - new Date(b.auction.endDate).getTime()
      case 'amount':
        return b.amount - a.amount
      case 'auction':
        return a.auction.title.localeCompare(b.auction.title)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredBids.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const isActiveBid = (bid: any) => {
  return bid.auction.status === 'active' && (bid.status === 'winning' || bid.status === 'outbid')
}

const getBidStatus = (bid: any) => {
  if (bid.auction.status === 'completed') {
    return bid.status === 'won' ? 'won' : 'lost'
  }
  return bid.status
}

const getBidStatusText = (bid: any) => {
  const status = getBidStatus(bid)
  switch (status) {
    case 'winning':
      return 'Winning'
    case 'outbid':
      return 'Outbid'
    case 'won':
      return 'Won'
    case 'lost':
      return 'Lost'
    default:
      return 'Active'
  }
}

const formatTimeLeft = (endDate: string) => {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return 'Less than 1h'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const clearFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.sortBy = 'recent'
  currentPage.value = 1
}

const placeNewBid = (auction: any) => {
  router.push(`/auctions/${auction.id}`)
}

const contactSeller = (auction: any) => {
  // Implement contact seller functionality
  alert(`Contacting seller for: ${auction.title}`)
}

onMounted(async () => {
  loading.value = true
  try {
    // In a real app, fetch user's bids from the store
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  } catch (error) {
    console.error('Failed to fetch bids:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.my-bids {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.my-bids-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.header-content p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-outline:hover {
  background: #3498db;
  color: white;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-content h3 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.stat-content p {
  color: #7f8c8d;
  margin: 0;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #ecf0f1;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ecf0f1;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.bids-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.bid-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
}

.bid-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.bid-image {
  position: relative;
  width: 200px;
  height: 150px;
  overflow: hidden;
  flex-shrink: 0;
}

.bid-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bid-status {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.bid-status.winning {
  background: #27ae60;
  color: white;
}

.bid-status.outbid {
  background: #e74c3c;
  color: white;
}

.bid-status.won {
  background: #3498db;
  color: white;
}

.bid-status.lost {
  background: #95a5a6;
  color: white;
}

.bid-content {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.bid-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.auction-title {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  line-height: 1.4;
  flex: 1;
  margin-right: 1rem;
}

.bid-amount {
  text-align: right;
  flex-shrink: 0;
}

.amount-label {
  display: block;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.amount-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: #27ae60;
}

.auction-details {
  margin-bottom: 1.5rem;
  flex: 1;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 500;
  color: #2c3e50;
}

.bid-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #ecf0f1;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: #3498db;
  color: #3498db;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 2px solid #ecf0f1;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
}

.page-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.page-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

@media (max-width: 768px) {
  .my-bids {
    padding: 1rem;
  }
  
  .my-bids-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .bid-card {
    flex-direction: column;
  }
  
  .bid-image {
    width: 100%;
    height: 200px;
  }
  
  .bid-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .bid-amount {
    text-align: left;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
