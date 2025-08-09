<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuctionStore, type Auction } from '@/stores/auction'

const auctionStore = useAuctionStore()

const featuredAuctions = ref<Auction[]>([])
const categories = ref([
  { name: 'Electronics', icon: '📱', count: 1250 },
  { name: 'Art', icon: '🎨', count: 890 },
  { name: 'Collectibles', icon: '🏆', count: 650 },
  { name: 'Jewelry', icon: '💎', count: 420 },
  { name: 'Vehicles', icon: '🚗', count: 180 },
  { name: 'Real Estate', icon: '🏠', count: 95 }
])

const formatTimeLeft = (endDate: string) => {
  const end = new Date(endDate)
  const now = new Date()
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h`
  return 'Less than 1h'
}

onMounted(async () => {
  try {
    await auctionStore.fetchAuctions()
    featuredAuctions.value = auctionStore.activeAuctions.slice(0, 6)
  } catch (error) {
    console.error('Failed to fetch auctions:', error)
  }
})
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Discover Amazing Items at
          <span class="highlight">AuctionZ</span>
        </h1>
        <p class="hero-subtitle">
          The premier online auction platform where buyers and sellers connect. 
          Bid on unique items or create your own auctions to reach thousands of potential buyers.
        </p>
        <div class="hero-actions">
          <router-link to="/auctions" class="btn btn-primary btn-large">
            Browse Auctions
          </router-link>
          <router-link to="/register" class="btn btn-outline btn-large">
            Start Selling
          </router-link>
        </div>
      </div>
      <div class="hero-image">
        <div class="hero-placeholder">
          <span class="hero-icon">🏷️</span>
          <p>Live Auctions</p>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">10,000+</div>
          <div class="stat-label">Active Auctions</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50,000+</div>
          <div class="stat-label">Happy Users</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">$2M+</div>
          <div class="stat-label">Total Sales</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">99.9%</div>
          <div class="stat-label">Success Rate</div>
        </div>
      </div>
    </section>

    <!-- Featured Auctions -->
    <section class="featured">
      <div class="section-header">
        <h2>Featured Auctions</h2>
        <router-link to="/auctions" class="view-all">View All Auctions</router-link>
      </div>
      <div class="auctions-grid">
        <div v-for="auction in featuredAuctions" :key="auction.id" class="auction-card">
          <div class="auction-image">
            <img :src="auction.images[0]" :alt="auction.title" />
            <div class="auction-status" :class="auction.status">
              {{ auction.status }}
            </div>
          </div>
          <div class="auction-content">
            <h3 class="auction-title">{{ auction.title }}</h3>
            <p class="auction-description">{{ auction.description.substring(0, 100) }}...</p>
            <div class="auction-meta">
              <div class="auction-price">
                <span class="current-price">${{ auction.currentPrice.toLocaleString() }}</span>
                <span class="bid-count">{{ auction.totalBids }} bids</span>
              </div>
              <div class="auction-time">
                <span class="time-left">Ends in {{ formatTimeLeft(auction.endDate) }}</span>
              </div>
            </div>
            <router-link :to="`/auctions/${auction.id}`" class="btn btn-primary btn-full">
              View Auction
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="how-it-works">
      <div class="section-header">
        <h2>How It Works</h2>
        <p>Get started with AuctionZ in just a few simple steps</p>
      </div>
      <div class="steps-grid">
        <div class="step">
          <div class="step-icon">📝</div>
          <h3>Create Account</h3>
          <p>Sign up as a buyer or seller and complete your profile</p>
        </div>
        <div class="step">
          <div class="step-icon">🏷️</div>
          <h3>List or Bid</h3>
          <p>Sellers create auctions, buyers place bids on items they want</p>
        </div>
        <div class="step">
          <div class="step-icon">⚡</div>
          <h3>Real-time Bidding</h3>
          <p>Experience the excitement of live bidding with real-time updates</p>
        </div>
        <div class="step">
          <div class="step-icon">✅</div>
          <h3>Complete Transaction</h3>
          <p>Winning bidders pay securely and sellers ship items safely</p>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories">
      <div class="section-header">
        <h2>Popular Categories</h2>
        <p>Explore auctions by category</p>
      </div>
      <div class="categories-grid">
        <div v-for="category in categories" :key="category.name" class="category-card">
          <div class="category-icon">{{ category.icon }}</div>
          <h3>{{ category.name }}</h3>
          <p>{{ category.count }} active auctions</p>
          <router-link :to="`/auctions?category=${category.name}`" class="category-link">
            Browse {{ category.name }}
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>Ready to Start?</h2>
        <p>Join thousands of users who are already buying and selling on AuctionZ</p>
        <div class="cta-actions">
          <router-link to="/register" class="btn btn-primary btn-large">
            Create Account
          </router-link>
          <router-link to="/auctions" class="btn btn-outline btn-large">
            Explore Auctions
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-content {
  padding: 0 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: var(--color-heading);
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.highlight {
  color: var(--color-heading);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--color-text);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.hero-placeholder {
  background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background) 100%);
  border: 2px dashed var(--color-border);
  border-radius: 1rem;
  padding: 4rem 2rem;
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.hero-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.hero-placeholder p {
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 500;
}

.stats {
  background: var(--color-background-soft);
  padding: 4rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text);
  font-size: 1rem;
}

.featured,
.how-it-works,
.categories,
.cta {
  padding: 4rem 0;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
  padding: 0 2rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--color-text);
}

.view-all {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.view-all:hover {
  color: #1a202c;
}

.auctions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
}

.auction-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.auction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.auction-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.auction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auction-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
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

.auction-content {
  padding: 1.5rem;
}

.auction-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.auction-description {
  color: var(--color-text);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.auction-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--color-heading);
}

.bid-count {
  font-size: 0.875rem;
  color: var(--color-text);
  margin-left: 0.5rem;
}

.time-left {
  font-size: 0.875rem;
  color: var(--color-text);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
}

.step {
  text-align: center;
  padding: 2rem 1rem;
}

.step-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.step h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.step p {
  color: var(--color-text);
  line-height: 1.6;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding: 0 2rem;
}

.category-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.category-card p {
  color: var(--color-text);
  margin-bottom: 1rem;
}

.category-link {
  color: var(--color-heading);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.category-link:hover {
  color: #1a202c;
}

.cta {
  background: var(--color-background-soft);
  border-top: 1px solid var(--color-border);
}

.cta-content {
  text-align: center;
  padding: 0 2rem;
}

.cta-content h2 {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--color-heading);
  margin-bottom: 1rem;
}

.cta-content p {
  font-size: 1.125rem;
  color: var(--color-text);
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
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

.btn-primary:hover {
  background: #1a202c;
}

.btn-outline {
  border-color: var(--color-border);
  color: var(--color-text);
  background: transparent;
}

.btn-outline:hover {
  background: var(--color-background-soft);
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-full {
  width: 100%;
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 0;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .auctions-grid {
    grid-template-columns: 1fr;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
