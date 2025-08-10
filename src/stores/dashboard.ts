import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usersAPI, adminAPI } from '@/services/api'

export interface DashboardStats {
  // Buyer stats
  active_bids?: number
  winning_bids?: number
  won_auctions?: number
  total_spent?: number
  total_bids?: number

  // Seller stats
  active_auctions?: number
  completed_auctions?: number
  total_sales?: number
  total_bids_received?: number
  total_auctions?: number

  // Admin stats
  total_users?: number
  total_auctions?: number
  pending_auctions?: number
  total_value?: number
}

export interface SellerAnalytics {
  total_auctions: number
  active_auctions: number
  completed_auctions: number
  pending_auctions: number
  total_sales: number
  average_sale_price: number
  success_rate: number
  recent_sales_count: number
  recent_revenue: number
  sold_auctions: any[]
}

export interface BuyerAnalytics {
  total_bids: number
  active_bids: number
  winning_bids: number
  won_auctions: number
  total_spent: number
  average_bid_amount: number
  success_rate: number
  recent_bids_count: number
  recent_spending: number
  favorite_category: string | null
  recent_bids: any[]
}

export interface RecentActivity {
  id: string
  type: 'bid' | 'auction' | 'user' | 'system'
  title: string
  timestamp: string
  user?: string
  amount?: number
}

export interface AdminDashboardData {
  platform_stats: {
    total_users: number
    total_buyers: number
    total_sellers: number
    total_admins: number
    total_auctions: number
    active_auctions: number
    pending_auctions: number
    ended_auctions: number
    total_bids: number
    total_value: number
  }
  recent_users: any[]
  recent_auctions: any[]
  system_health: {
    database_status: string
    api_status: string
    last_backup: string
    uptime: string
  }
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats | null>(null)
  const recentActivity = ref<RecentActivity[]>([])
  const adminData = ref<AdminDashboardData | null>(null)
  const sellerAnalytics = ref<SellerAnalytics | null>(null)
  const buyerAnalytics = ref<BuyerAnalytics | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties for different user types
  const buyerStats = computed(() => ({
    activeBids: stats.value?.active_bids || 0,
    winningBids: stats.value?.winning_bids || 0,
    wonAuctions: stats.value?.won_auctions || 0,
    totalSpent: stats.value?.total_spent || 0,
    totalBids: stats.value?.total_bids || 0,
  }))

  const sellerStats = computed(() => ({
    activeAuctions: stats.value?.active_auctions || 0,
    completedAuctions: stats.value?.completed_auctions || 0,
    totalSales: stats.value?.total_sales || 0,
    totalBidsReceived: stats.value?.total_bids_received || 0,
    totalAuctions: stats.value?.total_auctions || 0,
  }))

  const adminStats = computed(() => ({
    totalUsers: stats.value?.total_users || 0,
    totalAuctions: stats.value?.total_auctions || 0,
    activeAuctions: stats.value?.active_auctions || 0,
    pendingAuctions: stats.value?.pending_auctions || 0,
    totalBids: stats.value?.total_bids || 0,
    totalValue: stats.value?.total_value || 0,
  }))

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await usersAPI.getDashboardStats()
      stats.value = response.data.stats
      return response.data.stats
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load dashboard statistics'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const response = await usersAPI.getRecentActivity()
      recentActivity.value = [
        ...response.data.recent_bids.map((bid: any) => ({
          id: bid.id,
          type: 'bid' as const,
          title: `Placed bid on ${bid.auction_title}`,
          timestamp: bid.created_at,
          amount: bid.amount,
        })),
        ...response.data.recent_auctions.map((auction: any) => ({
          id: auction.id,
          type: 'auction' as const,
          title: `Created auction: ${auction.title}`,
          timestamp: auction.created_at,
        })),
      ]
      return recentActivity.value
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load recent activity'
      throw err
    }
  }

  // Fetch admin dashboard data
  const fetchAdminDashboard = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await adminAPI.getDashboard()
      adminData.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load admin dashboard'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Fetch seller analytics
  const fetchSellerAnalytics = async () => {
    try {
      const response = await usersAPI.getSellerAnalytics()
      sellerAnalytics.value = response.data.analytics
      return response.data.analytics
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load seller analytics'
      throw err
    }
  }

  // Fetch buyer analytics
  const fetchBuyerAnalytics = async () => {
    try {
      const response = await usersAPI.getBuyerAnalytics()
      buyerAnalytics.value = response.data.analytics
      return response.data.analytics
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load buyer analytics'
      throw err
    }
  }

  // Fetch system health
  const fetchSystemHealth = async () => {
    try {
      const response = await adminAPI.getSystemHealth()
      return response.data.system_health
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to load system health'
      throw err
    }
  }

  // Clear store data
  const clearDashboard = () => {
    stats.value = null
    recentActivity.value = []
    adminData.value = null
    sellerAnalytics.value = null
    buyerAnalytics.value = null
    error.value = null
  }

  return {
    stats,
    recentActivity,
    adminData,
    sellerAnalytics,
    buyerAnalytics,
    loading,
    error,
    buyerStats,
    sellerStats,
    adminStats,
    fetchDashboardStats,
    fetchRecentActivity,
    fetchAdminDashboard,
    fetchSellerAnalytics,
    fetchBuyerAnalytics,
    fetchSystemHealth,
    clearDashboard,
  }
})
