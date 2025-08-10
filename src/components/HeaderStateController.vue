<template>
  <div class="header-state-controller">
    <div class="controller-panel">
      <h3>Header Menu State Control</h3>

      <div class="state-options">
        <div class="state-option">
          <label>
            <input
              type="radio"
              v-model="currentState"
              value="authenticated"
              :disabled="!authStore.isAuthenticated"
            />
            Logged-in User Menu
          </label>
          <span class="state-description">
            Shows user avatar, role-based dashboard links, and user-specific actions
          </span>
        </div>

        <div class="state-option">
          <label>
            <input type="radio" v-model="currentState" value="with-auth" />
            Guest Menu (with Login/Signup)
          </label>
          <span class="state-description"> Shows login and signup buttons for new users </span>
        </div>

        <div class="state-option">
          <label>
            <input type="radio" v-model="currentState" value="without-auth" />
            Guest Menu (without Login/Signup)
          </label>
          <span class="state-description">
            Shows only informational links (About, Contact, Help)
          </span>
        </div>
      </div>

      <div class="current-state-info">
        <h4>Current State: {{ getStateDescription() }}</h4>
        <p>{{ getStateDetails() }}</p>
      </div>

      <div class="state-actions">
        <button @click="resetToDefault" class="btn btn-secondary">Reset to Default</button>
        <button @click="toggleState" class="btn btn-primary">Toggle State</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Header state control
const currentState = ref<'authenticated' | 'with-auth' | 'without-auth'>('with-auth')

// Computed property to control showAuthOptions in parent
const showAuthOptions = computed(() => {
  if (currentState.value === 'authenticated') {
    return true // This won't matter since user is authenticated
  }
  return currentState.value === 'with-auth'
})

// Watch for authentication changes and update state accordingly
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      currentState.value = 'authenticated'
    } else {
      currentState.value = 'with-auth'
    }
  },
)

// Methods
const getStateDescription = () => {
  switch (currentState.value) {
    case 'authenticated':
      return 'Logged-in User Menu'
    case 'with-auth':
      return 'Guest Menu (with Login/Signup)'
    case 'without-auth':
      return 'Guest Menu (without Login/Signup)'
    default:
      return 'Unknown State'
  }
}

const getStateDetails = () => {
  switch (currentState.value) {
    case 'authenticated':
      return `Shows personalized menu for ${authStore.userRole} user with dashboard, profile, and session management options.`
    case 'with-auth':
      return 'Displays login and signup buttons for new users who want to create an account or sign in.'
    case 'without-auth':
      return 'Shows only informational links for users who want to browse without creating an account.'
    default:
      return ''
  }
}

const resetToDefault = () => {
  if (authStore.isAuthenticated) {
    currentState.value = 'authenticated'
  } else {
    currentState.value = 'with-auth'
  }
}

const toggleState = () => {
  if (authStore.isAuthenticated) {
    // If authenticated, stay in authenticated state
    return
  }

  // Toggle between with-auth and without-auth
  currentState.value = currentState.value === 'with-auth' ? 'without-auth' : 'with-auth'
}

// Expose the computed property to parent
defineExpose({
  showAuthOptions,
})
</script>

<style scoped>
.header-state-controller {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.controller-panel h3 {
  margin: 0 0 1rem 0;
  color: var(--color-heading);
  font-size: 1.25rem;
}

.state-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.state-option {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.state-option label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-heading);
  cursor: pointer;
}

.state-option input[type='radio'] {
  margin: 0;
}

.state-option input[type='radio']:disabled + span {
  opacity: 0.5;
  cursor: not-allowed;
}

.state-description {
  font-size: 0.875rem;
  color: var(--color-text);
  margin-left: 1.5rem;
}

.current-state-info {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.current-state-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
  font-size: 1rem;
}

.current-state-info p {
  margin: 0;
  color: var(--color-text);
  font-size: 0.875rem;
  line-height: 1.4;
}

.state-actions {
  display: flex;
  gap: 1rem;
}

.state-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .header-state-controller {
    padding: 1rem;
  }

  .state-actions {
    flex-direction: column;
  }
}
</style>
