<template>
  <div class="dashboard">
    <!-- Session Navigation -->
    <SessionNavigation />

    <DashboardLoading v-if="loading" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardLoading from '@/components/DashboardLoading.vue'
import SessionNavigation from '@/components/SessionNavigation.vue'

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
}
</style>
