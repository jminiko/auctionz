<template>
  <div v-if="currentError" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="modal-icon" :class="iconClass">
          <svg
            v-if="currentError.type === 'error'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
          <svg
            v-else-if="currentError.type === 'warning'"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor" />
          </svg>
          <svg
            v-else
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h3 class="modal-title">{{ currentError.title }}</h3>
        <button @click="close" class="close-button" aria-label="Close">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <p class="error-message">{{ currentError.message }}</p>
        <div v-if="currentError.details" class="error-details">
          <details>
            <summary>Technical Details</summary>
            <pre>{{ currentError.details }}</pre>
          </details>
        </div>
      </div>

      <div class="modal-footer">
        <button v-if="currentError.retryable" @click="retry" class="btn btn-primary">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
              fill="currentColor"
            />
          </svg>
          Try Again
        </button>
        <button @click="close" class="btn btn-secondary">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { errorHandler, type AppError } from '@/services/errorHandler'

const errors = ref<AppError[]>([])

const currentError = computed(() => errors.value[0])

const iconClass = computed(() => {
  if (!currentError.value) return ''

  switch (currentError.value.type) {
    case 'error':
      return 'error-icon'
    case 'warning':
      return 'warning-icon'
    case 'info':
      return 'info-icon'
    default:
      return 'error-icon'
  }
})

const updateErrors = (newErrors: AppError[]) => {
  errors.value = newErrors
}

const close = () => {
  if (currentError.value) {
    errorHandler.removeError(currentError.value.id)
  }
}

const retry = () => {
  if (currentError.value?.onRetry) {
    currentError.value.onRetry()
  }
  close()
}

const handleOverlayClick = (event: Event) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

onMounted(() => {
  errorHandler.addListener(updateErrors)
  errors.value = errorHandler.getErrors()
})

onUnmounted(() => {
  errorHandler.removeListener(updateErrors)
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  gap: 0.75rem;
}

.modal-icon {
  flex-shrink: 0;
}

.error-icon {
  color: #ef4444;
}

.warning-icon {
  color: #f59e0b;
}

.info-icon {
  color: #3b82f6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  flex-grow: 1;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1rem 1.5rem;
}

.error-message {
  margin: 0 0 1rem 0;
  color: #374151;
  line-height: 1.6;
}

.error-details {
  margin-top: 1rem;
}

.error-details details {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.error-details summary {
  padding: 0.75rem 1rem;
  background: #f9fafb;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
}

.error-details summary:hover {
  background: #f3f4f6;
}

.error-details pre {
  margin: 0;
  padding: 1rem;
  background: #1f2937;
  color: #f9fafb;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem;
  justify-content: flex-end;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
