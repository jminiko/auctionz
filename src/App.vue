<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import SessionAwareWrapper from './components/SessionAwareWrapper.vue'
import SessionLifecycleStatus from './components/SessionLifecycleStatus.vue'
import ErrorBoundary from './components/ErrorBoundary.vue'
import { useSessionLifecycle } from './services/sessionLifecycle'
import GlobalErrorModal from '@/components/GlobalErrorModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const sessionLifecycle = useSessionLifecycle()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const showAuthOptions = ref(true) // Control whether to show login/signup options

const userInitials = computed(() => {
  if (!authStore.user) return ''
  return `${authStore.user.first_name[0]}${authStore.user.last_name[0]}`.toUpperCase()
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

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)

  // Initialize session lifecycle manager
  if (authStore.isAuthenticated) {
    try {
      await sessionLifecycle.initialize(router, authStore)
    } catch (error) {
      console.error('Failed to initialize session lifecycle:', error)
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  sessionLifecycle.destroy()
})
</script>

<template>
  <div id="app">
    <RouterView />
    <GlobalErrorModal />
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

.guest-links {
  display: flex;
  gap: 1rem;
  align-items: center;
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

.mobile-auth {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.mobile-guest {
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
