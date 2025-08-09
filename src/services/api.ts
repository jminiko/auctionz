import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: any) => api.put('/auth/change-password', data),
  verifyEmail: () => api.post('/auth/verify-email')
}

// Auctions API
export const auctionsAPI = {
  getAll: (params?: any) => api.get('/auctions/', { params }),
  getById: (id: string) => api.get(`/auctions/${id}`),
  create: (data: any) => api.post('/auctions/', data),
  update: (id: string, data: any) => api.put(`/auctions/${id}`, data),
  delete: (id: string) => api.delete(`/auctions/${id}`),
  getMyAuctions: (params?: any) => api.get('/auctions/my-auctions', { params }),
  getFeatured: () => api.get('/auctions/featured'),
  getCategories: () => api.get('/auctions/categories')
}

// Bids API
export const bidsAPI = {
  placeBid: (auctionId: string, data: any) => api.post(`/bids/${auctionId}`, data),
  getAuctionBids: (auctionId: string, params?: any) => api.get(`/bids/${auctionId}`, { params }),
  getMyBids: (params?: any) => api.get('/bids/my-bids', { params }),
  getBid: (bidId: string) => api.get(`/bids/${bidId}`),
  cancelBid: (bidId: string) => api.delete(`/bids/${bidId}`),
  getStats: () => api.get('/bids/stats')
}

// Users API
export const usersAPI = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  getUserAuctions: (userId: string, params?: any) => api.get(`/users/${userId}/auctions`, { params }),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
  getRecentActivity: () => api.get('/users/dashboard/recent-activity'),
  getWatchlist: () => api.get('/users/watchlist'),
  getNotifications: () => api.get('/users/notifications'),
  markNotificationRead: (notificationId: string) => api.put(`/users/notifications/${notificationId}/read`),
  getSettings: () => api.get('/users/settings'),
  updateSettings: (data: any) => api.put('/users/settings', data)
}

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params?: any) => api.get('/admin/users', { params }),
  getUserDetails: (userId: string) => api.get(`/admin/users/${userId}`),
  updateUserStatus: (userId: string, data: any) => api.put(`/admin/users/${userId}/status`, data),
  updateUserRole: (userId: string, data: any) => api.put(`/admin/users/${userId}/role`, data),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  getAllAuctions: (params?: any) => api.get('/admin/auctions', { params }),
  approveAuction: (auctionId: string) => api.put(`/admin/auctions/${auctionId}/approve`),
  suspendAuction: (auctionId: string) => api.put(`/admin/auctions/${auctionId}/suspend`),
  deleteAuction: (auctionId: string) => api.delete(`/admin/auctions/${auctionId}`),
  getReports: () => api.get('/admin/reports'),
  getSystemHealth: () => api.get('/admin/system/health')
}

// Health check
export const healthAPI = {
  check: () => api.get('/health')
}

export default api
