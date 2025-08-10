<template>
  <div class="auction-list">
    <!-- Session Navigation -->
    <SessionNavigation />

    <div class="page-header">
      <h1>Browse Auctions</h1>
      <p>Discover amazing items up for auction</p>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search auctions..."
          class="search-input"
          @input="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">🔍</button>
      </div>

      <div class="filters">
        <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Art">Art</option>
          <option value="Collectibles">Collectibles</option>
          <option value="Jewelry">Jewelry</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Real Estate">Real Estate</option>
        </select>

        <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="ended">Ended</option>
        </select>

        <select v-model="selectedCondition" @change="applyFilters" class="filter-select">
          <option value="">All Conditions</option>
          <option value="new">New</option>
          <option value="used">Used</option>
          <option value="refurbished">Refurbished</option>
        </select>

        <select v-model="sortBy" @change="applyFilters" class="filter-select">
          <option value="endDate">Ending Soon</option>
          <option value="current_price">Price: Low to High</option>
          <option value="current_price-desc">Price: High to Low</option>
          <option value="bid_count">Most Bids</option>
          <option value="start_date">Newest</option>
        </select>
      </div>

      <div class="price-filter">
        <div class="price-inputs">
          <input
            v-model="minPrice"
            type="number"
            placeholder="Min Price"
            class="price-input"
            @input="applyFilters"
          />
          <span class="price-separator">-</span>
          <input
            v-model="maxPrice"
            type="number"
            placeholder="Max Price"
            class="price-input"
            @input="applyFilters"
          />
        </div>
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="auctionStore.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading auctions...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="auctionStore.error" class="error-state">
      <p>{{ auctionStore.error }}</p>
      <button @click="loadAuctions" class="btn btn-primary">Try Again</button>
    </div>

    <!-- Results -->
    <div v-else class="results-section">
      <div class="results-header">
        <p class="results-count">
          {{ filteredAuctions.length }} auction{{ filteredAuctions.length !== 1 ? 's' : '' }} found
        </p>
        <div class="view-toggle">
          <button @click="viewMode = 'grid'" :class="['view-btn', { active: viewMode === 'grid' }]">
            Grid
          </button>
          <button @click="viewMode = 'list'" :class="['view-btn', { active: viewMode === 'list' }]">
            List
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="auctions-grid">
        <div v-for="auction in paginatedAuctions" :key="auction.id" class="auction-card">
          <div class="auction-image">
            <img :src="auction.images[0]" :alt="auction.title" />
            <div class="auction-status" :class="auction.status">
              {{ auction.status }}
            </div>
            <div class="auction-overlay">
              <router-link :to="`/auctions/${auction.id}`" class="view-btn-overlay">
                View Details
              </router-link>
            </div>
          </div>
          <div class="auction-content">
            <h3 class="auction-title">
              <router-link :to="`/auctions/${auction.id}`">
                {{ auction.start_date }}
              </router-link>
            </h3>
            <p class="auction-description">{{ auction.description }}...</p>
            <div class="auction-meta">
              <div class="auction-price">
                <span class="current-price">${{ auction.current_price }}</span>
                <span class="bid-count">{{ auction.bid_count }} bids</span>
              </div>
              <div class="auction-time">
                <span class="time-left">Ends in {{ formatTimeLeft(auction.end_date) }}</span>
              </div>
            </div>
            <div class="auction-footer">
              <span class="seller">by {{ auction.sellerName }}</span>
              <span class="location">{{ auction.location }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="auctions-list">
        <div v-for="auction in paginatedAuctions" :key="auction.id" class="auction-item">
          <div class="auction-item-image">
            <img :src="auction.images[0]" :alt="auction.title" />
            <div class="auction-status" :class="auction.status">
              {{ auction.status }}
            </div>
          </div>
          <div class="auction-item-content">
            <h3 class="auction-title">
              <router-link :to="`/auctions/${auction.id}`">
                {{ auction.title }}
              </router-link>
            </h3>
            <p class="auction-description">{{ auction.description.substring(0, 150) }}...</p>
            <div class="auction-details">
              <div class="detail-item">
                <span class="label">Current Price:</span>
                <span class="value price">${{ auction.currentPrice.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Bids:</span>
                <span class="value">{{ auction.totalBids }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Ends:</span>
                <span class="value">{{ formatTimeLeft(auction.endDate) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Seller:</span>
                <span class="value">{{ auction.sellerName }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Location:</span>
                <span class="value">{{ auction.location }}</span>
              </div>
            </div>
          </div>
          <div class="auction-item-actions">
            <router-link :to="`/auctions/${auction.id}`" class="btn btn-primary">
              View Auction
            </router-link>
            <button class="btn btn-outline">Watch</button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button @click="currentPage--" :disabled="currentPage === 1" class="pagination-btn">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctionStore } from '@/stores/auction'
import SessionNavigation from '@/components/SessionNavigation.vue'

const route = useRoute()
const auctionStore = useAuctionStore()

// View state
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const itemsPerPage = 12

// Filters
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedCondition = ref('')
const sortBy = ref('endDate')
const minPrice = ref('')
const maxPrice = ref('')

// Computed properties
const filteredAuctions = computed(() => {
  let filtered = auctionStore.auctions

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (auction) =>
        auction.title.toLowerCase().includes(query) ||
        auction.description?.toLowerCase().includes(query),
    )
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((auction) => auction.category === selectedCategory.value)
  }

  // Apply status filter
  if (selectedStatus.value) {
    filtered = filtered.filter((auction) => auction.status === selectedStatus.value)
  }

  // Apply condition filter
  if (selectedCondition.value) {
    filtered = filtered.filter((auction) => auction.condition === selectedCondition.value)
  }

  // Apply price filters
  if (minPrice.value) {
    filtered = filtered.filter((auction) => auction.current_price >= Number(minPrice.value))
  }
  if (maxPrice.value) {
    filtered = filtered.filter((auction) => auction.current_price <= Number(maxPrice.value))
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'current_price':
        return a.current_price - b.current_price
      case 'current_price-desc':
        return b.current_price - a.current_price
      case 'bid_count':
        return b.bid_count - a.bid_count
      case 'start_date':
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      case 'endDate':
      default:
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredAuctions.value.length / itemsPerPage))

const paginatedAuctions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAuctions.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

// Methods
const loadAuctions = async () => {
  try {
    await auctionStore.fetchAuctions()
  } catch (error) {
    console.error('Failed to load auctions:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  applyFilters()
}

const applyFilters = () => {
  currentPage.value = 1
  auctionStore.updateFilters({
    search: searchQuery.value,
    category: selectedCategory.value,
    status: selectedStatus.value,
    condition: selectedCondition.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
  })
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedCondition.value = ''
  sortBy.value = 'endDate'
  minPrice.value = ''
  maxPrice.value = ''
  currentPage.value = 1
  auctionStore.clearFilters()
}

const formatTimeLeft = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return 'Less than 1m'
}

// Watch for route changes to apply category filter from URL
watch(
  () => route.query.category,
  (newCategory) => {
    if (newCategory) {
      selectedCategory.value = newCategory as string
      applyFilters()
    }
  },
  { immediate: true },
)

onMounted(() => {
  loadAuctions()
})
</script>

<style scoped>
.auction-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #7f8c8d;
  font-size: 1.125rem;
}

.filters-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem 0 0 0.5rem;
  font-size: 1rem;
  background: var(--color-background);
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-heading);
}

.search-btn {
  padding: 0.75rem 1rem;
  background: var(--color-heading);
  color: white;
  border: none;
  border-radius: 0 0.5rem 0.5rem 0;
  cursor: pointer;
  font-size: 1rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-heading);
}

.price-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  width: 120px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.price-separator {
  color: var(--color-text);
  font-weight: 500;
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  background: var(--color-background-soft);
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 3px solid var(--color-border);
  border-top: 3px solid var(--color-heading);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.results-count {
  color: var(--color-text);
  font-size: 1rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background: var(--color-heading);
  color: white;
  border-color: var(--color-heading);
}

/* Grid View */
.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.auction-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
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

.auction-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.auction-card:hover .auction-overlay {
  opacity: 1;
}

.view-btn-overlay {
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border: 2px solid white;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
}

.view-btn-overlay:hover {
  background: white;
  color: black;
}

.auction-content {
  padding: 1.5rem;
}

.auction-title a {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.25rem;
}

.auction-title a:hover {
  color: #1a202c;
}

.auction-description {
  color: var(--color-text);
  margin: 0.5rem 0 1rem;
  line-height: 1.5;
}

.auction-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-price {
  font-size: 1.25rem;
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

.auction-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--color-text);
}

/* List View */
.auctions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.auction-item {
  display: grid;
  grid-template-columns: 200px 1fr auto;
  gap: 1.5rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.auction-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.auction-item-image {
  position: relative;
  height: 150px;
  overflow: hidden;
  border-radius: 0.5rem;
}

.auction-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-item-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.auction-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-item .label {
  color: var(--color-text);
  font-weight: 500;
}

.detail-item .value {
  color: var(--color-heading);
}

.detail-item .value.price {
  font-weight: bold;
  font-size: 1rem;
}

.auction-item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  justify-content: center;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-background-soft);
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
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 3rem;
}

.page-btn:hover {
  background: var(--color-background-soft);
}

.page-btn.active {
  background: var(--color-heading);
  color: white;
  border-color: var(--color-heading);
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
  .filters {
    grid-template-columns: 1fr;
  }

  .price-filter {
    flex-direction: column;
    align-items: stretch;
  }

  .price-inputs {
    justify-content: center;
  }

  .auction-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .auction-item-actions {
    flex-direction: row;
    justify-content: center;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }

  .page-numbers {
    order: -1;
  }
}
</style>
