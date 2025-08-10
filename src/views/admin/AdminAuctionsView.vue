<template>
  <div class="admin-auctions">
    <div class="page-header">
      <h1>Auction Management</h1>
      <p>Manage and monitor all auctions on the platform</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalAuctions }}</div>
          <div class="stat-label">Total Auctions</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.activeAuctions }}</div>
          <div class="stat-label">Active</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏳</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.pendingAuctions }}</div>
          <div class="stat-label">Pending</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-number">${{ stats.totalValue.toLocaleString() }}</div>
          <div class="stat-label">Total Value</div>
        </div>
      </div>
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
        <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="ended">Ended</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Art">Art</option>
          <option value="Collectibles">Collectibles</option>
          <option value="Jewelry">Jewelry</option>
          <option value="Vehicles">Vehicles</option>
          <option value="Real Estate">Real Estate</option>
        </select>

        <select v-model="sortBy" @change="applyFilters" class="filter-select">
          <option value="createdAt">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="currentPrice">Price: Low to High</option>
          <option value="currentPrice-desc">Price: High to Low</option>
          <option value="endDate">Ending Soon</option>
        </select>
      </div>
    </div>

    <!-- Auctions Table -->
    <div class="auctions-table">
      <div class="table-header">
        <div class="table-cell">Auction</div>
        <div class="table-cell">Seller</div>
        <div class="table-cell">Price</div>
        <div class="table-cell">Bids</div>
        <div class="table-cell">Status</div>
        <div class="table-cell">End Date</div>
        <div class="table-cell">Actions</div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading auctions...</p>
      </div>

      <div v-else-if="filteredAuctions.length === 0" class="empty-state">
        <p>No auctions found</p>
      </div>

      <div v-else class="table-body">
        <div v-for="auction in paginatedAuctions" :key="auction.id" class="table-row">
          <div class="table-cell auction-info">
            <div class="auction-image">
              <img :src="auction.images[0]" :alt="auction.title" />
            </div>
            <div class="auction-details">
              <div class="auction-title">{{ auction.title }}</div>
              <div class="auction-category">{{ auction.category }}</div>
            </div>
          </div>
          <div class="table-cell">{{ auction.sellerName }}</div>
          <div class="table-cell">
            <div class="price-info">
              <div class="current-price">${{ auction.currentPrice.toLocaleString() }}</div>
              <div class="starting-price">
                Started: ${{ auction.starting_price.toLocaleString() }}
              </div>
            </div>
          </div>
          <div class="table-cell">{{ auction.totalBids }}</div>
          <div class="table-cell">
            <span class="status-badge" :class="auction.status">{{ auction.status }}</span>
          </div>
          <div class="table-cell">{{ formatDate(auction.endDate) }}</div>
          <div class="table-cell actions">
            <router-link :to="`/auctions/${auction.id}`" class="btn btn-outline btn-small">
              View
            </router-link>
            <button
              v-if="auction.status === 'pending'"
              @click="approveAuction(auction.id)"
              class="btn btn-success btn-small"
            >
              Approve
            </button>
            <button
              v-if="auction.status === 'active'"
              @click="suspendAuction(auction.id)"
              class="btn btn-warning btn-small"
            >
              Suspend
            </button>
            <button @click="deleteAuction(auction.id)" class="btn btn-danger btn-small">
              Delete
            </button>
          </div>
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

      <button @click="currentPage++" :disabled="currentPage === totalPages" class="pagination-btn">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuctionStore } from '@/stores/auction'

const auctionStore = useAuctionStore()

const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 20

// Filters
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedCategory = ref('')
const sortBy = ref('createdAt')

// Mock data
const stats = ref({
  totalAuctions: 2847,
  activeAuctions: 2150,
  pendingAuctions: 23,
  totalValue: 2850000,
})

const auctions = ref([
  {
    id: 1,
    title: 'Vintage Watch Collection',
    category: 'Collectibles',
    sellerName: 'John Smith',
    currentPrice: 2500,
    starting_price: 1000,
    totalBids: 15,
    status: 'active',
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    images: ['https://picsum.photos/100/100?random=1'],
  },
  {
    id: 2,
    title: 'Antique Furniture Set',
    category: 'Art',
    sellerName: 'Sarah Johnson',
    currentPrice: 1800,
    starting_price: 800,
    totalBids: 8,
    status: 'pending',
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    images: ['https://picsum.photos/100/100?random=2'],
  },
  {
    id: 3,
    title: 'Modern Art Piece',
    category: 'Art',
    sellerName: 'Mike Davis',
    currentPrice: 5000,
    starting_price: 3000,
    totalBids: 12,
    status: 'active',
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    images: ['https://picsum.photos/100/100?random=3'],
  },
])

const filteredAuctions = computed(() => {
  let filtered = auctions.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (auction) =>
        auction.title.toLowerCase().includes(query) ||
        auction.sellerName.toLowerCase().includes(query) ||
        auction.category.toLowerCase().includes(query),
    )
  }

  // Apply status filter
  if (selectedStatus.value) {
    filtered = filtered.filter((auction) => auction.status === selectedStatus.value)
  }

  // Apply category filter
  if (selectedCategory.value) {
    filtered = filtered.filter((auction) => auction.category === selectedCategory.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'createdAt':
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      case 'createdAt-asc':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      case 'currentPrice':
        return a.currentPrice - b.currentPrice
      case 'currentPrice-desc':
        return b.currentPrice - a.currentPrice
      case 'endDate':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      default:
        return 0
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const handleSearch = () => {
  currentPage.value = 1
  applyFilters()
}

const applyFilters = () => {
  currentPage.value = 1
}

const approveAuction = (auctionId: number) => {
  console.log('Approve auction:', auctionId)
}

const suspendAuction = (auctionId: number) => {
  console.log('Suspend auction:', auctionId)
}

const deleteAuction = (auctionId: number) => {
  if (confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
    console.log('Delete auction:', auctionId)
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await auctionStore.fetchAuctions()
  } catch (error) {
    console.error('Failed to load auctions:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.admin-auctions {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--color-text);
  font-size: 1.125rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-soft);
  border-radius: 0.75rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--color-text);
  font-size: 0.875rem;
}

.filters-section {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
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

.auctions-table {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-heading);
  border-bottom: 1px solid var(--color-border);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-background-soft);
}

.table-cell {
  display: flex;
  align-items: center;
}

.auction-info {
  gap: 1rem;
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

.auction-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.auction-title {
  color: var(--color-heading);
  font-weight: 500;
}

.auction-category {
  color: var(--color-text);
  font-size: 0.875rem;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.current-price {
  color: var(--color-heading);
  font-weight: 600;
}

.starting-price {
  color: var(--color-text);
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.ended {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.cancelled {
  background: #f3f4f6;
  color: #6b7280;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.loading-state,
.empty-state {
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
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

.btn-outline {
  border-color: var(--color-border);
  color: var(--color-text);
  background: transparent;
}

.btn-outline:hover {
  background: var(--color-background-soft);
}

.btn-small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
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

  .filters {
    grid-template-columns: 1fr;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .table-header {
    display: none;
  }

  .table-row {
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
  }

  .table-cell {
    justify-content: space-between;
  }

  .table-cell::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--color-heading);
  }

  .actions {
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
