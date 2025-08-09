<template>
  <div class="my-auctions">
    <div class="my-auctions-header">
      <div class="header-content">
        <h1>My Auctions</h1>
        <p>Manage your auction listings and track their performance</p>
      </div>
      <router-link to="/create-auction" class="btn btn-primary">
        <span>+</span>
        Create New Auction
      </router-link>
    </div>

    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <h3>{{ stats.total }}</h3>
          <p>Total Auctions</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🟢</div>
        <div class="stat-content">
          <h3>{{ stats.active }}</h3>
          <p>Active</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <h3>{{ stats.completed }}</h3>
          <p>Completed</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>${{ stats.totalRevenue.toLocaleString() }}</h3>
          <p>Total Revenue</p>
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
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select v-model="filters.category" class="filter-select">
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing & Fashion</option>
          <option value="jewelry">Jewelry & Watches</option>
          <option value="art">Art & Collectibles</option>
          <option value="books">Books & Media</option>
          <option value="sports">Sports & Outdoor</option>
          <option value="automotive">Automotive</option>
          <option value="home">Home & Garden</option>
          <option value="other">Other</option>
        </select>

        <select v-model="filters.sortBy" class="filter-select">
          <option value="created">Date Created</option>
          <option value="ending">Ending Soon</option>
          <option value="bids">Most Bids</option>
          <option value="price">Price</option>
        </select>

        <button @click="clearFilters" class="btn btn-outline">
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Auctions Grid -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading your auctions...</p>
    </div>

    <div v-else-if="filteredAuctions.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>No auctions found</h3>
      <p>{{ filters.search || filters.status || filters.category ? 'Try adjusting your filters' : 'Start by creating your first auction' }}</p>
      <router-link v-if="!filters.search && !filters.status && !filters.category" to="/create-auction" class="btn btn-primary">
        Create Your First Auction
      </router-link>
    </div>

    <div v-else class="auctions-grid">
      <div
        v-for="auction in filteredAuctions"
        :key="auction.id"
        class="auction-card"
      >
        <div class="auction-image">
          <img :src="auction.images[0] || '/placeholder-image.jpg'" :alt="auction.title" />
          <div class="auction-status" :class="auction.status">
            {{ auction.status }}
          </div>
        </div>

        <div class="auction-content">
          <h3 class="auction-title">{{ auction.title }}</h3>
          <p class="auction-description">{{ auction.description.substring(0, 100) }}...</p>
          
          <div class="auction-details">
            <div class="detail-item">
              <span class="detail-label">Current Price:</span>
              <span class="detail-value price">${{ auction.currentPrice.toLocaleString() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Bids:</span>
              <span class="detail-value">{{ auction.bidCount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Ends:</span>
              <span class="detail-value">{{ formatTimeLeft(auction.endDate) }}</span>
            </div>
          </div>

          <div class="auction-actions">
            <router-link :to="`/auctions/${auction.id}`" class="btn btn-outline btn-sm">
              View Details
            </router-link>
            <button @click="editAuction(auction)" class="btn btn-outline btn-sm">
              Edit
            </button>
            <button @click="deleteAuction(auction.id)" class="btn btn-danger btn-sm">
              Delete
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
const itemsPerPage = 12

const filters = reactive({
  search: '',
  status: '',
  category: '',
  sortBy: 'created'
})

const stats = computed(() => {
  const myAuctions = auctionStore.myAuctions
  return {
    total: myAuctions.length,
    active: myAuctions.filter(a => a.status === 'active').length,
    completed: myAuctions.filter(a => a.status === 'ended').length,
    totalRevenue: myAuctions
      .filter(a => a.status === 'ended')
      .reduce((sum, a) => sum + a.currentPrice, 0)
  }
})

const filteredAuctions = computed(() => {
  let filtered = auctionStore.myAuctions

  if (filters.search) {
    filtered = filtered.filter(auction =>
      auction.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      auction.description.toLowerCase().includes(filters.search.toLowerCase())
    )
  }

  if (filters.status) {
    filtered = filtered.filter(auction => auction.status === filters.status)
  }

  if (filters.category) {
    filtered = filtered.filter(auction => auction.category === filters.category)
  }

  // Sort
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'ending':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      case 'bids':
        return b.totalBids - a.totalBids
      case 'price':
        return b.currentPrice - a.currentPrice
      default:
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredAuctions.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

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

const clearFilters = () => {
  filters.search = ''
  filters.status = ''
  filters.category = ''
  filters.sortBy = 'created'
  currentPage.value = 1
}

const editAuction = (auction: any) => {
  // Navigate to edit page or open edit modal
  router.push(`/auctions/${auction.id}/edit`)
}

const deleteAuction = async (auctionId: string) => {
  if (!confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
    return
  }

  try {
    await auctionStore.deleteAuction(auctionId)
  } catch (error) {
    console.error('Failed to delete auction:', error)
    alert('Failed to delete auction. Please try again.')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await auctionStore.fetchAuctions()
  } catch (error) {
    console.error('Failed to fetch auctions:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.my-auctions {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.my-auctions-header {
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

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
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

.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.auction-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.auction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.auction-status.active {
  background: #27ae60;
  color: white;
}

.auction-status.pending {
  background: #f39c12;
  color: white;
}

.auction-status.completed {
  background: #3498db;
  color: white;
}

.auction-status.cancelled {
  background: #e74c3c;
  color: white;
}

.auction-content {
  padding: 1.5rem;
}

.auction-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.auction-description {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.auction-details {
  margin-bottom: 1.5rem;
}

.detail-item {
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

.detail-value.price {
  color: #27ae60;
  font-weight: 600;
}

.auction-actions {
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
  .my-auctions {
    padding: 1rem;
  }
  
  .my-auctions-header {
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
  
  .auctions-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
