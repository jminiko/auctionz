<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <h2>🚨 Application Error</h2>
      <p>Something went wrong. Please try refreshing the page.</p>
      
      <details class="error-details">
        <summary>Error Details</summary>
        <pre class="error-stack">{{ error.message }}</pre>
        <pre class="error-stack">{{ error.stack }}</pre>
      </details>
      
      <div class="error-actions">
        <button @click="reloadPage" class="btn btn-primary">Reload Page</button>
        <button @click="clearError" class="btn btn-outline">Dismiss</button>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err: Error) => {
  console.error('Error caught by boundary:', err)
  error.value = err
  return false // Prevent error from propagating
})

const reloadPage = () => {
  window.location.reload()
}

const clearError = () => {
  error.value = null
}
</script>

<style scoped>
.error-boundary {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.error-content {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.error-content h2 {
  color: var(--color-danger);
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.error-content p {
  color: var(--color-text);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

.error-details {
  margin: 1.5rem 0;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
}

.error-details summary {
  padding: 1rem;
  background: var(--color-background-soft);
  cursor: pointer;
  font-weight: 500;
  color: var(--color-heading);
}

.error-details summary:hover {
  background: var(--color-background);
}

.error-stack {
  padding: 1rem;
  background: var(--color-background-soft);
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  border-top: 1px solid var(--color-border);
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.error-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .error-boundary {
    padding: 1rem;
  }
  
  .error-content {
    padding: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
  }
}
</style>
