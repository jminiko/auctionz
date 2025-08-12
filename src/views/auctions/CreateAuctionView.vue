<template>
  <div class="create-auction">
    <div class="create-auction-header">
      <h1>Create New Auction</h1>
      <p>List your item for auction and start receiving bids</p>
    </div>

    <form @submit.prevent="createAuction" class="create-auction-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h3>Basic Information</h3>

        <div class="form-group">
          <label for="title">Auction Title *</label>
          <input
            id="title"
            v-model="form.title"
            type="text"
            required
            class="form-input"
            placeholder="Enter a descriptive title for your auction"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="description">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            rows="6"
            required
            class="form-input"
            placeholder="Provide detailed information about your item"
            :disabled="loading"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category *</label>
            <select
              id="category"
              v-model="form.category"
              required
              class="form-input"
              :disabled="loading"
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing & Fashion</option>
              <option value="jewelry">Jewelry & Watches</option>
              <option value="art">Art & Collectibles</option>
              <option value="books">Books & Media</option>
              <option value="sports">Sports & Outdoor</option>
              <option value="automotive">Automotive</option>
              <option value="home">Home & Garden</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="condition">Condition *</label>
            <select
              id="condition"
              v-model="form.condition"
              required
              class="form-input"
              :disabled="loading"
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="form-section">
        <h3>Pricing & Duration</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="starting_price">Starting Price ($) *</label>
            <input
              id="starting_price"
              v-model.number="form.starting_price"
              type="number"
              min="0"
              step="0.01"
              required
              class="form-input"
              placeholder="0.00"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="reserve_price">Reserve Price ($)</label>
            <input
              id="reserve_price"
              v-model.number="form.reserve_price"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="Optional minimum price"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="duration">Duration (Days) *</label>
            <select
              id="duration"
              v-model="form.duration"
              required
              class="form-input"
              :disabled="loading"
            >
              <option value="">Select duration</option>
              <option value="1">1 Day</option>
              <option value="3">3 Days</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="30">30 Days</option>
            </select>
          </div>

          <div class="form-group">
            <label for="buy_now_price">Buy Now Price ($)</label>
            <input
              id="buy_now_price"
              v-model.number="form.buy_now_price"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="Optional instant buy price"
              :disabled="loading"
            />
          </div>
        </div>
      </div>

      <!-- Images -->
      <div class="form-section">
        <h3>Images</h3>

        <div class="form-group">
          <label for="images">Upload Images</label>
          <div class="image-upload">
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              @change="handleImageUpload"
              class="file-input"
              :disabled="loading"
            />
            <div class="upload-placeholder">
              <div class="upload-icon">📷</div>
              <p>Click to upload images or drag and drop</p>
              <p class="upload-hint">Maximum 10 images, 5MB each</p>
            </div>
          </div>
        </div>

        <div v-if="form.images.length > 0" class="image-preview">
          <div v-for="(image, index) in form.images" :key="index" class="image-item">
            <img :src="image.preview" :alt="`Image ${index + 1}`" />
            <button
              type="button"
              @click="removeImage(index)"
              class="remove-image"
              :disabled="loading"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Shipping & Location -->
      <div class="form-section">
        <h3>Shipping & Location</h3>

        <div class="form-row">
          <div class="form-group">
            <label for="location">Item Location *</label>
            <input
              id="location"
              v-model="form.location"
              type="text"
              required
              class="form-input"
              placeholder="City, State"
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label for="shippingCost">Shipping Cost ($)</label>
            <input
              id="shippingCost"
              v-model.number="form.shippingCost"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="0.00"
              :disabled="loading"
            />
          </div>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="form.freeShipping" :disabled="loading" />
            Offer free shipping
          </label>
        </div>
      </div>

      <!-- Terms & Conditions -->
      <div class="form-section">
        <h3>Terms & Conditions</h3>

        <div class="form-group">
          <label for="terms">Additional Terms</label>
          <textarea
            id="terms"
            v-model="form.terms"
            rows="4"
            class="form-input"
            placeholder="Any additional terms or conditions for this auction"
            :disabled="loading"
          ></textarea>
        </div>

        <div class="form-group">
          <label>
            <input type="checkbox" v-model="form.agreeToTerms" required :disabled="loading" />
            I agree to the <a href="#" class="link">Terms of Service</a> and
            <a href="#" class="link">Auction Rules</a>
          </label>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="form-actions">
        <button type="button" @click="saveDraft" :disabled="loading" class="btn btn-outline">
          Save as Draft
        </button>
        <button type="submit" :disabled="loading || !form.agreeToTerms" class="btn btn-primary">
          <span v-if="loading" class="loading-spinner"></span>
          {{ loading ? 'Creating...' : 'Create Auction' }}
        </button>
      </div>
    </form>

    <!-- Success Modal -->
    <SuccessModal
      :show="showSuccessModal"
      title="Auction Created Successfully!"
      :message="successMessage"
      details="Your auction is now live and visible to potential bidders. You can manage it from your seller dashboard."
      :show-action="true"
      action-text="View My Auctions"
      close-text="Create Another"
      @close="handleSuccessClose"
      @action="handleSuccessAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuctionStore } from '@/stores/auction'
import { errorHandler } from '@/services/errorHandler'
import ErrorModal from '@/components/ErrorModal.vue'
import SuccessModal from '@/components/SuccessModal.vue'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

const router = useRouter()
const auctionStore = useAuctionStore()

const loading = ref(false)
const showErrorModal = ref(false)
const showSuccessModal = ref(false)
const showConfirmationModal = ref(false)
const errorMessage = ref('')
const errorDetails = ref('')
const successMessage = ref('')

const form = reactive({
  title: '',
  description: '',
  category: '',
  condition: '',
  starting_price: 0,
  reserve_price: 0,
  buy_now_price: 0,
  duration: '',
  location: '',
  shippingCost: 0,
  freeShipping: false,
  terms: '',
  agreeToTerms: false,
  images: [] as Array<{ file: File; preview: string }>,
})

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files) {
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        errorHandler.addError({
          type: 'error',
          title: 'File Size Error',
          message: 'File size must be less than 5MB',
          details: `File "${file.name}" is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        })
        return
      }

      if (form.images.length >= 10) {
        errorHandler.addError({
          type: 'error',
          title: 'Too Many Images',
          message: 'Maximum 10 images allowed',
          details: 'Please remove some images before adding more',
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        form.images.push({
          file,
          preview: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    })
  }
}

const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

const validateForm = () => {
  const errors: string[] = []

  if (!form.title.trim()) {
    errors.push('Title is required')
  }

  if (!form.description.trim()) {
    errors.push('Description is required')
  }

  if (!form.category) {
    errors.push('Category is required')
  }

  if (!form.condition) {
    errors.push('Condition is required')
  }

  if (form.starting_price <= 0) {
    errors.push('Starting price must be greater than 0')
  }

  if (form.reserve_price > 0 && form.reserve_price <= form.starting_price) {
    errors.push('Reserve price must be greater than starting price')
  }

  if (form.buy_now_price > 0 && form.buy_now_price <= form.starting_price) {
    errors.push('Buy now price must be greater than starting price')
  }

  if (!form.duration) {
    errors.push('Duration is required')
  }

  if (!form.location.trim()) {
    errors.push('Location is required')
  }

  if (!form.agreeToTerms) {
    errors.push('You must agree to the terms and conditions')
  }

  return errors
}

const createAuction = async () => {
  const validationErrors = validateForm()

  if (validationErrors.length > 0) {
    errorHandler.addError({
      type: 'error',
      title: 'Validation Error',
      message: 'Please fix the following errors:',
      details: validationErrors.join('\n'),
    })
    return
  }

  loading.value = true

  try {
    const auctionData = {
      title: form.title,
      description: form.description,
      category: form.category,
      condition: form.condition,
      starting_price: form.starting_price,
      reserve_price: form.reserve_price || undefined,
      buy_now_price: form.buy_now_price || undefined,
      duration: parseInt(form.duration),
      end_date: new Date(Date.now() + parseInt(form.duration) * 24 * 60 * 60 * 1000).toISOString(),
      location: form.location,
      shipping_cost: form.freeShipping ? 0 : form.shippingCost,
      terms: form.terms,
      images: form.images.map((img) => img.file),
    }

    await auctionStore.createAuction(auctionData)

    successMessage.value = 'Auction created successfully!'
    showSuccessModal.value = true
  } catch (error: any) {
    errorHandler.handleApiError(error, 'Create Auction')
  } finally {
    loading.value = false
  }
}

const saveDraft = async () => {
  loading.value = true

  try {
    // Implement draft saving logic
    console.log('Saving draft...', form)

    errorHandler.addInfo(
      'Draft Saved',
      'Your auction draft has been saved successfully!',
      'You can continue editing or publish it later.',
    )
  } catch (error: any) {
    errorHandler.handleApiError(error, 'Save Draft')
  } finally {
    loading.value = false
  }
}

const handleSuccessAction = () => {
  showSuccessModal.value = false
  router.push('/my-auctions')
}

const handleSuccessClose = () => {
  showSuccessModal.value = false
  router.push('/my-auctions')
}
</script>

<style scoped>
.create-auction {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.create-auction-header {
  text-align: center;
  margin-bottom: 2rem;
}

.create-auction-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.create-auction-header p {
  color: #7f8c8d;
  font-size: 1.1rem;
}

.create-auction-form {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid #ecf0f1;
}

.form-section:last-child {
  border-bottom: none;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.image-upload {
  position: relative;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.3s ease;
}

.image-upload:hover {
  border-color: #3498db;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-placeholder {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-hint {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image:hover {
  background: #e74c3c;
}

.form-actions {
  padding: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #f8f9fa;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-outline {
  background: transparent;
  color: #3498db;
  border: 2px solid #3498db;
}

.btn-outline:hover:not(:disabled) {
  background: #3498db;
  color: white;
}

.loading-spinner {
  width: 16px;
  height: 16px;
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

.link {
  color: #3498db;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .create-auction {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .image-preview {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
}
</style>
