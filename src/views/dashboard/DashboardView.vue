<template>
  <div class="dashboard">
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  try {
    // Ensure user data is loaded
    if (!authStore.user && authStore.token) {
      await authStore.fetchUser()
    }
    
    // Redirect to appropriate dashboard based on user role
    if (authStore.isAdmin) {
      router.replace('/admin-dashboard')
    } else if (authStore.isSeller) {
      router.replace('/seller-dashboard')
    } else if (authStore.isBuyer) {
      router.replace('/buyer-dashboard')
    } else {
      // Fallback to home if no role is determined
      router.replace('/')
    }
  } catch (error) {
    console.error('Failed to load user data:', error)
    router.replace('/login')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  text-align: center;
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

.loading-container p {
  color: var(--color-text);
  font-size: 1.125rem;
}
</style>
