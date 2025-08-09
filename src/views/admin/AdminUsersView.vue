<template>
  <div class="admin-users">
    <div class="page-header">
      <h1>User Management</h1>
      <p>Manage user accounts and permissions</p>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalUsers }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.buyers }}</div>
          <div class="stat-label">Buyers</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏪</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.sellers }}</div>
          <div class="stat-label">Sellers</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👑</div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.admins }}</div>
          <div class="stat-label">Admins</div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users..."
          class="search-input"
          @input="handleSearch"
        />
        <button @click="handleSearch" class="search-btn">
          🔍
        </button>
      </div>

      <div class="filters">
        <select v-model="selectedRole" @change="applyFilters" class="filter-select">
          <option value="">All Roles</option>
          <option value="buyer">Buyers</option>
          <option value="seller">Sellers</option>
          <option value="admin">Admins</option>
        </select>

        <select v-model="selectedStatus" @change="applyFilters" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>

        <select v-model="sortBy" @change="applyFilters" class="filter-select">
          <option value="createdAt">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="firstName">Name A-Z</option>
          <option value="firstName-desc">Name Z-A</option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="users-table">
      <div class="table-header">
        <div class="table-cell">User</div>
        <div class="table-cell">Email</div>
        <div class="table-cell">Role</div>
        <div class="table-cell">Status</div>
        <div class="table-cell">Joined</div>
        <div class="table-cell">Actions</div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading users...</p>
      </div>

      <div v-else-if="filteredUsers.length === 0" class="empty-state">
        <p>No users found</p>
      </div>

      <div v-else class="table-body">
        <div v-for="user in paginatedUsers" :key="user.id" class="table-row">
          <div class="table-cell user-info">
            <div class="user-avatar">
              {{ getUserInitials(user) }}
            </div>
            <div class="user-details">
              <div class="user-name">{{ user.firstName }} {{ user.lastName }}</div>
              <div class="user-id">ID: {{ user.id }}</div>
            </div>
          </div>
          <div class="table-cell">{{ user.email }}</div>
          <div class="table-cell">
            <span class="role-badge" :class="user.role">{{ user.role }}</span>
          </div>
          <div class="table-cell">
            <span class="status-badge" :class="user.status">{{ user.status }}</span>
          </div>
          <div class="table-cell">{{ formatDate(user.createdAt) }}</div>
          <div class="table-cell actions">
            <button @click="viewUser(user)" class="btn btn-outline btn-small">
              View
            </button>
            <button v-if="user.status === 'active'" @click="suspendUser(user.id)" class="btn btn-warning btn-small">
              Suspend
            </button>
            <button v-else @click="activateUser(user.id)" class="btn btn-success btn-small">
              Activate
            </button>
            <button @click="deleteUser(user.id)" class="btn btn-danger btn-small">
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const loading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 20

// Filters
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const sortBy = ref('createdAt')

// Mock data
const stats = ref({
  totalUsers: 15420,
  buyers: 12350,
  sellers: 2980,
  admins: 90
})

const users = ref([
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    role: 'buyer',
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    role: 'seller',
    status: 'active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Davis',
    email: 'mike.davis@example.com',
    role: 'buyer',
    status: 'suspended',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
])

const filteredUsers = computed(() => {
  let filtered = users.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }

  // Apply role filter
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // Apply status filter
  if (selectedStatus.value) {
    filtered = filtered.filter(user => user.status === selectedStatus.value)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'createdAt-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'firstName':
        return a.firstName.localeCompare(b.firstName)
      case 'firstName-desc':
        return b.firstName.localeCompare(a.firstName)
      default:
        return 0
    }
  })

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
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

const getUserInitials = (user: any) => {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
}

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

const viewUser = (user: any) => {
  console.log('View user:', user)
}

const suspendUser = (userId: number) => {
  console.log('Suspend user:', userId)
}

const activateUser = (userId: number) => {
  console.log('Activate user:', userId)
}

const deleteUser = (userId: number) => {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    console.log('Delete user:', userId)
  }
}

onMounted(() => {
  // Load users data
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
})
</script>

<style scoped>
.admin-users {
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

.users-table {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 2fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: var(--color-background-soft);
  font-weight: 600;
  color: var(--color-heading);
  border-bottom: 1px solid var(--color-border);
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 2fr;
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

.user-info {
  gap: 1rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--color-heading);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  color: var(--color-heading);
  font-weight: 500;
}

.user-id {
  color: var(--color-text);
  font-size: 0.75rem;
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-badge.buyer {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.seller {
  background: #dcfce7;
  color: #166534;
}

.role-badge.admin {
  background: #fef3c7;
  color: #92400e;
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

.status-badge.suspended {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
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

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover {
  background: #059669;
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
