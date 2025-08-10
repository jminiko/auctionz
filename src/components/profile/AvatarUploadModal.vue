<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>Upload Avatar</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <div class="modal-content">
        <div
          class="upload-area"
          @click="triggerFileInput"
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          />

          <div v-if="!selectedFile && !previewUrl" class="upload-placeholder">
            <div class="upload-icon">📷</div>
            <h4>Upload your avatar</h4>
            <p>Click to select or drag and drop an image</p>
            <p class="upload-hint">Supports: JPG, PNG, GIF (max 5MB)</p>
          </div>

          <div v-else-if="previewUrl" class="upload-preview">
            <img :src="previewUrl" alt="Avatar preview" class="preview-image" />
            <div class="preview-overlay">
              <button @click="triggerFileInput" class="change-btn">Change Image</button>
            </div>
          </div>
        </div>

        <div v-if="selectedFile" class="file-info">
          <div class="file-details">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button @click="removeFile" class="remove-btn">Remove</button>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="avatar-options">
          <h4>Avatar Options</h4>
          <div class="option-grid">
            <div class="option-item" @click="useDefaultAvatar">
              <div class="option-avatar default">👤</div>
              <span>Use Default</span>
            </div>
            <div class="option-item" @click="generateInitialsAvatar">
              <div class="option-avatar initials">{{ getUserInitials() }}</div>
              <span>Use Initials</span>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="$emit('close')" class="btn btn-secondary" :disabled="uploading">
            Cancel
          </button>
          <button
            @click="uploadAvatar"
            class="btn btn-primary"
            :disabled="uploading || !selectedFile"
          >
            <span v-if="uploading" class="loading-spinner"></span>
            {{ uploading ? 'Uploading...' : 'Upload Avatar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usersAPI } from '@/services/api'

const emit = defineEmits<{
  close: []
  updated: []
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const uploading = ref(false)
const error = ref('')

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    validateAndSetFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    validateAndSetFile(files[0])
  }
}

const validateAndSetFile = (file: File) => {
  error.value = ''

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Please select a valid image file (JPG, PNG, or GIF)'
    return
  }

  // Check file size (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    error.value = 'File size must be less than 5MB'
    return
  }

  selectedFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const removeFile = () => {
  selectedFile.value = null
  previewUrl.value = ''
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getUserInitials = () => {
  // This would come from the user context
  return 'JD'
}

const useDefaultAvatar = () => {
  selectedFile.value = null
  previewUrl.value = ''
  error.value = ''
  // In a real implementation, you might set a default avatar URL
}

const generateInitialsAvatar = () => {
  selectedFile.value = null
  previewUrl.value = ''
  error.value = ''
  // In a real implementation, you might generate an initials-based avatar
}

const uploadAvatar = async () => {
  if (!selectedFile.value) return

  try {
    uploading.value = true
    error.value = ''

    const formData = new FormData()
    formData.append('avatar', selectedFile.value)

    // Note: This would need to be implemented in the backend
    // For now, we'll simulate the upload
    await new Promise((resolve) => setTimeout(resolve, 2000))

    emit('updated')
  } catch (err) {
    console.error('Failed to upload avatar:', err)
    error.value = 'Failed to upload avatar. Please try again.'
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(107, 114, 128, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #f8fafc;
  border-radius: 1.5rem;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #475569;
}

.modal-content {
  padding: 2rem;
}

.upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  margin-bottom: 1.5rem;
}

.upload-area:hover {
  border-color: #3498db;
  background: #f8fafc;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  color: #64748b;
}

.upload-placeholder h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.upload-placeholder p {
  color: #64748b;
  margin: 0;
}

.upload-hint {
  font-size: 0.875rem;
  color: #94a3b8;
}

.upload-preview {
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e2e8f0;
}

.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.upload-preview:hover .preview-overlay {
  opacity: 1;
}

.change-btn {
  background: white;
  color: #1e293b;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: #1e293b;
  font-size: 0.875rem;
}

.file-size {
  color: #64748b;
  font-size: 0.75rem;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background: #dc2626;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.avatar-options {
  margin-bottom: 2rem;
}

.avatar-options h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.option-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-item:hover {
  border-color: #3498db;
  background: #f8fafc;
}

.option-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.option-avatar.default {
  background: #e2e8f0;
  color: #64748b;
}

.option-avatar.initials {
  background: linear-gradient(135deg, #3498db 0%, #1d4ed8 100%);
  color: white;
}

.option-item span {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  color: #334155;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .modal {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }

  .modal-header,
  .modal-content {
    padding: 1rem;
  }

  .option-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }
}
</style>
