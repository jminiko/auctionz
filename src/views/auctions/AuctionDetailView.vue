<template>
  <div class="auction-detail">
    <div v-if="auctionStore.loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading auction details...</p>
    </div>

    <div v-else-if="!auction" class="error-state">
      <p>Auction not found</p>
      <router-link to="/auctions" class="btn btn-primary">Back to Auctions</router-link>
    </div>

    <div v-else class="auction-content">
      <!-- Auction Images -->
      <div class="auction-images">
        <div class="main-image">
          <img :src="currentImage" :alt="auction.title" />
        </div>
        <div class="image-thumbnails">
          <button
            v-for="(image, index) in auctionImages"
            :key="index"
            @click="currentImage = image"
            :class="['thumbnail', { active: currentImage === image }]"
          >
            <img :src="image" :alt="`${auction.title} - Image ${index + 1}`" />
          </button>
        </div>
      </div>

      <!-- Auction Info -->
      <div class="auction-info">
        <div class="auction-header">
          <h1>{{ auction.title }}</h1>
          <div class="auction-status" :class="auction.status">
            {{ auction.status }}
          </div>
        </div>

        <div class="auction-meta">
          <div class="meta-item">
            <span class="label">Seller:</span>
            <span class="value"
              >{{ auction.seller.first_name }} {{ auction.seller.last_name }}</span
            >
          </div>
          <div class="meta-item">
            <span class="label">Category:</span>
            <span class="value">{{ auction.category }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Condition:</span>
            <span class="value">{{ auction.condition }}</span>
          </div>
          <div class="meta-item">
            <span class="label">Location:</span>
            <span class="value">{{ auction.location }}</span>
          </div>
        </div>

        <div class="auction-description">
          <h3>Description</h3>
          <p>{{ auction.description }}</p>
        </div>

        <!-- Bidding Section -->
        <div class="bidding-section">
          <div class="current-price">
            <span class="label">Current Price:</span>
            <span class="price">${{ auction.current_price }}</span>
          </div>

          <div class="bid-info">
            <div class="bid-count">{{ auction.bid_count }} bids</div>
            <div class="time-left">Ends in {{ formatTimeLeft(auction.end_date) }}</div>
          </div>

          <!-- Bidding Form -->
          <div v-if="canBid" class="bidding-form">
            <div class="bid-input-group">
              <label for="bidAmount">Your Bid:</label>
              <div class="bid-input-wrapper">
                <span class="currency">$</span>
                <input
                  id="bidAmount"
                  v-model="bidAmount"
                  type="number"
                  :min="minBidAmount"
                  :step="bidIncrement"
                  class="bid-input"
                  placeholder="Enter bid amount"
                />
              </div>
              <div class="bid-suggestions">
                <button
                  v-for="suggestion in bidSuggestions"
                  :key="suggestion"
                  @click="bidAmount = String(suggestion)"
                  class="suggestion-btn"
                >
                  ${{ suggestion.toLocaleString() }}
                </button>
              </div>
            </div>
            <button @click="placeBid" :disabled="!canPlaceBid" class="btn btn-primary btn-large">
              Place Bid
            </button>
          </div>

          <div v-else class="bidding-disabled">
            <p v-if="!authStore.isAuthenticated">
              Please <router-link to="/login">sign in</router-link> to place a bid.
            </p>
            <p v-else-if="auction.status !== 'active' && auction.status !== 'pending'">
              This auction is no longer active.
            </p>
            <p v-else>You cannot bid on your own auction.</p>
          </div>
        </div>

        <!-- Bid History -->
        <div class="bid-history">
          <h3>Bid History</h3>
          <div v-if="!auction.bid_count || auction.bid_count === 0" class="no-bids">
            No bids yet. Be the first to bid!
          </div>
          <div v-else class="bids-list">
            <div
              v-for="bid in auctionStore.myBids.slice().reverse()"
              :key="bid.id"
              class="bid-item"
            >
              <div class="bid-info">
                <div class="bidder">{{ bid.bidder?.first_name }} {{ bid.bidder?.last_name }}</div>
                <div class="bid-amount">${{ bid.amount.toLocaleString() }}</div>
              </div>
              <div class="bid-time">{{ formatDate(bid.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuctionStore } from '@/stores/auction'
import { parseAuctionImages } from '@/utils/imageUtils'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const auctionStore = useAuctionStore()

const currentImage = ref('')
const bidAmount = ref('')

const auction = computed(() => auctionStore.currentAuction)

// Parse images from JSON string to array with full URLs
const auctionImages = computed(() => {
  if (!auction.value?.images) return []
  return parseAuctionImages(auction.value.images)
})

const canBid = computed(() => {
  if (!authStore.isAuthenticated) return false
  if (auction.value?.status !== 'active' && auction.value?.status !== 'pending') return false
  if (auction.value?.seller.id === authStore.user?.id) return false
  return true
})

const minBidAmount = computed(() => {
  if (!auction.value) return 0
  return auction.value.current_price + 1
})

const bidIncrement = computed(() => {
  if (!auction.value) return 1
  const price = auction.value.current_price
  if (price < 100) return 1
  if (price < 1000) return 5
  if (price < 10000) return 10
  return 50
})

const bidSuggestions = computed(() => {
  if (!auction.value) return []
  const current = auction.value.current_price
  const increment = bidIncrement.value
  return [current + increment, current + increment * 2, current + increment * 5]
})

const canPlaceBid = computed(() => {
  const amount = Number(bidAmount.value)
  return amount >= minBidAmount.value && amount > 0
})

const formatTimeLeft = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return 'Ended'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return 'Less than 1m'
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString()
}

const placeBid = async () => {
  if (!canPlaceBid.value) return

  try {
    console.log(auction.value!.id, Number(bidAmount.value))
    await auctionStore.placeBid(auction.value!.id, Number(bidAmount.value))
    bidAmount.value = ''
    // Refresh auction data
    await auctionStore.fetchAuctionById(auction.value!.id)
  } catch (error) {
    console.error('Failed to place bid:', error)
  }
}

onMounted(async () => {
  const auctionId = String(route.params.id)
  try {
    await auctionStore.fetchAuctionById(auctionId)
    if (auctionImages.value.length > 0) {
      // Use the first image from the parsed array
      currentImage.value = auctionImages.value[0]
    }
  } catch (error) {
    console.error('Failed to load auction:', error)
  }
})
</script>

<style scoped>
.auction-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
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

.auction-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
}

.auction-images {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 2px solid var(--color-border);
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s;
  background: none;
  padding: 0;
}

.thumbnail.active {
  border-color: var(--color-heading);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.auction-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.auction-header h1 {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-heading);
  margin: 0;
}

.auction-status {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
}

.auction-status.active {
  background: #dcfce7;
  color: #166534;
}

.auction-status.ended {
  background: #fef2f2;
  color: #dc2626;
}

.auction-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.auction-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-radius: 1rem;
}

.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-item .label {
  color: var(--color-text);
  font-weight: 500;
}

.meta-item .value {
  color: var(--color-heading);
  font-weight: 600;
}

.auction-description h3 {
  color: var(--color-heading);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.auction-description p {
  color: var(--color-text);
  line-height: 1.6;
}

.bidding-section {
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
}

.current-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-price .label {
  color: var(--color-text);
  font-size: 1.125rem;
}

.current-price .price {
  color: var(--color-heading);
  font-size: 2rem;
  font-weight: bold;
}

.bid-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.bidding-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bid-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bid-input-group label {
  color: var(--color-heading);
  font-weight: 500;
}

.bid-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency {
  position: absolute;
  left: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.bid-input {
  width: 100%;
  padding: 1rem 1rem 1rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  font-size: 1.125rem;
  background: var(--color-background);
  color: var(--color-text);
}

.bid-input:focus {
  outline: none;
  border-color: var(--color-heading);
  box-shadow: 0 0 0 3px rgba(44, 62, 80, 0.1);
}

.bid-suggestions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.suggestion-btn:hover {
  background: var(--color-background-soft);
  border-color: var(--color-heading);
}

.bidding-disabled {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
}

.bidding-disabled a {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 500;
}

.bid-history h3 {
  color: var(--color-heading);
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.no-bids {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.bids-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.bid-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.bidder {
  color: var(--color-heading);
  font-weight: 500;
}

.bid-amount {
  color: var(--color-heading);
  font-weight: bold;
  font-size: 1.125rem;
}

.bid-time {
  color: var(--color-text);
  font-size: 0.875rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: var(--color-heading);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1a202c;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

@media (max-width: 768px) {
  .auction-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .auction-meta {
    grid-template-columns: 1fr;
  }

  .current-price {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .bid-info {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .bid-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}
</style>
