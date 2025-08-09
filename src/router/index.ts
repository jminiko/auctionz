import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Public views
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/auth/LoginView.vue'
import RegisterView from '../views/auth/RegisterView.vue'
import AuctionListView from '../views/auctions/AuctionListView.vue'
import AuctionDetailView from '../views/auctions/AuctionDetailView.vue'

// Protected views
import DashboardView from '../views/dashboard/DashboardView.vue'
import BuyerDashboardView from '../views/dashboard/BuyerDashboardView.vue'
import SellerDashboardView from '../views/dashboard/SellerDashboardView.vue'
import AdminDashboardView from '../views/dashboard/AdminDashboardView.vue'
import ProfileView from '../views/profile/ProfileView.vue'

// Auction management
import CreateAuctionView from '../views/auctions/CreateAuctionView.vue'
import MyAuctionsView from '../views/auctions/MyAuctionsView.vue'
import MyBidsView from '../views/bids/MyBidsView.vue'

// Admin views
import AdminAuctionsView from '../views/admin/AdminAuctionsView.vue'
import AdminUsersView from '../views/admin/AdminUsersView.vue'

// Error pages
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'Home' }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Login' }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { title: 'Register' }
    },
    {
      path: '/auctions',
      name: 'auctions',
      component: AuctionListView,
      meta: { title: 'Auctions' }
    },
    {
      path: '/auctions/:id',
      name: 'auction-detail',
      component: AuctionDetailView,
      props: true,
      meta: { title: 'Auction Details' }
    },

    // Protected routes
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, title: 'Dashboard' }
    },
    {
      path: '/buyer-dashboard',
      name: 'buyer-dashboard',
      component: BuyerDashboardView,
      meta: { requiresAuth: true, role: 'buyer', title: 'Buyer Dashboard' }
    },
    {
      path: '/seller-dashboard',
      name: 'seller-dashboard',
      component: SellerDashboardView,
      meta: { requiresAuth: true, role: 'seller', title: 'Seller Dashboard' }
    },
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, role: 'admin', title: 'Admin Dashboard' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true, title: 'Profile' }
    },

    // Auction management routes
    {
      path: '/create-auction',
      name: 'create-auction',
      component: CreateAuctionView,
      meta: { requiresAuth: true, role: 'seller', title: 'Create Auction' }
    },
    {
      path: '/my-auctions',
      name: 'my-auctions',
      component: MyAuctionsView,
      meta: { requiresAuth: true, role: 'seller', title: 'My Auctions' }
    },
    {
      path: '/my-bids',
      name: 'my-bids',
      component: MyBidsView,
      meta: { requiresAuth: true, role: 'buyer', title: 'My Bids' }
    },

    // Admin routes
    {
      path: '/admin/auctions',
      name: 'admin-auctions',
      component: AdminAuctionsView,
      meta: { requiresAuth: true, role: 'admin', title: 'Manage Auctions' }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: AdminUsersView,
      meta: { requiresAuth: true, role: 'admin', title: 'Manage Users' }
    },

    // 404 page
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: { title: 'Page Not Found' }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - AuctionZ` : 'AuctionZ'
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check role-based access
  if (to.meta.role && authStore.userRole !== to.meta.role) {
    if (authStore.isAuthenticated) {
      // Redirect to appropriate dashboard based on user role
      if (authStore.isAdmin) {
        next({ name: 'admin-dashboard' })
      } else if (authStore.isSeller) {
        next({ name: 'seller-dashboard' })
      } else if (authStore.isBuyer) {
        next({ name: 'buyer-dashboard' })
      } else {
        next({ name: 'dashboard' })
      }
    } else {
      next({ name: 'login' })
    }
    return
  }
  
  // Redirect authenticated users away from auth pages
  if (authStore.isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    if (authStore.isAdmin) {
      next({ name: 'admin-dashboard' })
    } else if (authStore.isSeller) {
      next({ name: 'seller-dashboard' })
    } else if (authStore.isBuyer) {
      next({ name: 'buyer-dashboard' })
    } else {
      next({ name: 'dashboard' })
    }
    return
  }
  
  next()
})

export default router
