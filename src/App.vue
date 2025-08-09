<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const userInitials = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.firstName[0]}${authStore.user.lastName[0]}`.toUpperCase()
})

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const logout = () => {
  authStore.logout()
  showUserMenu.value = false
  showMobileMenu.value = false
  router.push('/')
}

// Close menus when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    showUserMenu.value = false
  }
  if (!target.closest('.mobile-menu-toggle') && !target.closest('.mobile-menu')) {
    showMobileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div id="app">
    <!-- Navigation Header -->
    <header class="header">
      <nav class="nav">
        <div class="nav-brand">
          <router-link to="/" class="brand">
            <span class="brand-icon">🏷️</span>
            <span class="brand-text">AuctionZ</span>
          </router-link>
        </div>

        <div class="nav-menu">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/auctions" class="nav-link">Auctions</router-link>
          
          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="user-menu">
            <button @click="toggleUserMenu" class="user-menu-button">
              <div class="user-avatar">
                {{ userInitials }}
              </div>
              <span class="user-name">{{ authStore.user?.firstName }}</span>
              <span class="dropdown-arrow">▼</span>
            </button>
            
            <div v-if="showUserMenu" class="user-dropdown">
              <router-link to="/dashboard" class="dropdown-item">
                Dashboard
              </router-link>
              <router-link to="/profile" class="dropdown-item">
                Profile
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="logout" class="dropdown-item logout">
                Logout
              </button>
            </div>
          </div>

          <!-- Auth Links -->
          <div v-else class="auth-links">
            <router-link to="/login" class="btn btn-outline">Login</router-link>
            <router-link to="/register" class="btn btn-primary">Sign Up</router-link>
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button @click="toggleMobileMenu" class="mobile-menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      <!-- Mobile Menu -->
      <div v-if="showMobileMenu" class="mobile-menu">
        <router-link to="/" class="mobile-link" @click="closeMobileMenu">Home</router-link>
        <router-link to="/auctions" class="mobile-link" @click="closeMobileMenu">Auctions</router-link>
        
        <div v-if="authStore.isAuthenticated" class="mobile-user-section">
          <div class="mobile-user-info">
            <div class="mobile-user-avatar">{{ userInitials }}</div>
            <div class="mobile-user-details">
              <div class="mobile-user-name">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</div>
              <div class="mobile-user-role">{{ authStore.userRole }}</div>
            </div>
          </div>
          <router-link to="/dashboard" class="mobile-link" @click="closeMobileMenu">Dashboard</router-link>
          <router-link to="/profile" class="mobile-link" @click="closeMobileMenu">Profile</router-link>
          <button @click="logout" class="mobile-link logout">Logout</button>
        </div>
        
        <div v-else class="mobile-auth">
          <router-link to="/login" class="mobile-link" @click="closeMobileMenu">Login</router-link>
          <router-link to="/register" class="mobile-link" @click="closeMobileMenu">Sign Up</router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>AuctionZ</h3>
          <p>The premier online auction platform for buyers and sellers.</p>
        </div>
        <div class="footer-section">
          <h4>Quick Links</h4>
          <router-link to="/auctions" class="footer-link">Browse Auctions</router-link>
          <router-link to="/register" class="footer-link">Create Account</router-link>
          <router-link to="/about" class="footer-link">About Us</router-link>
        </div>
        <div class="footer-section">
          <h4>Support</h4>
          <a href="#" class="footer-link">Help Center</a>
          <a href="#" class="footer-link">Contact Us</a>
          <a href="#" class="footer-link">Terms of Service</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 AuctionZ. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.header {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--color-heading);
  font-weight: bold;
  font-size: 1.5rem;
}

.brand-icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--color-heading);
}

.nav-link.router-link-active {
  color: var(--color-heading);
}

.user-menu {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.user-menu-button:hover {
  background-color: var(--color-background-soft);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: var(--color-heading);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.user-name {
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  z-index: 10;
  margin-top: 0.5rem;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: var(--color-text);
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--color-background-soft);
}

.dropdown-item.logout {
  color: #dc2626;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 0.5rem 0;
}

.auth-links {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--color-heading);
  color: white;
}

.btn-primary:hover {
  background-color: #1a202c;
}

.btn-outline {
  border-color: var(--color-border);
  color: var(--color-text);
}

.btn-outline:hover {
  background-color: var(--color-background-soft);
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-toggle span {
  width: 24px;
  height: 2px;
  background-color: var(--color-text);
  transition: all 0.2s;
}

.mobile-menu {
  display: none;
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  padding: 1rem;
}

.mobile-link {
  display: block;
  padding: 0.75rem 0;
  text-decoration: none;
  color: var(--color-text);
  border-bottom: 1px solid var(--color-border);
}

.mobile-link:last-child {
  border-bottom: none;
}

.mobile-link.logout {
  color: #dc2626;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.mobile-user-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.mobile-user-avatar {
  width: 48px;
  height: 48px;
  background: var(--color-heading);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.mobile-user-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.mobile-user-role {
  font-size: 0.875rem;
  color: var(--color-text);
  text-transform: capitalize;
}

.main {
  min-height: calc(100vh - 70px - 200px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.footer {
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.footer-section h3,
.footer-section h4 {
  margin-bottom: 1rem;
  color: var(--color-heading);
}

.footer-section p {
  color: var(--color-text);
  line-height: 1.6;
}

.footer-link {
  display: block;
  color: var(--color-text);
  text-decoration: none;
  margin-bottom: 0.5rem;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-heading);
}

.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding: 1rem;
  text-align: center;
  color: var(--color-text);
}

@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .mobile-menu-toggle {
    display: flex;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .main {
    padding: 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>
