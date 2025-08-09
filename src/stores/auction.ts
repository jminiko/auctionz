import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'
import { auctionsAPI, bidsAPI } from '@/services/api'

export interface Auction {
  id: string
  title: string
  description: string
  category: string
  condition: 'new' | 'used' | 'refurbished'
  starting_price: number
  current_price: number
  reserve_price?: number
  buy_now_price?: number
  shipping_cost: number
  location?: string
  images: string
  status: 'pending' | 'active' | 'ended' | 'cancelled' | 'sold'
  start_date: string
  end_date: string
  terms?: string
  view_count: number
  watch_count: number
  created_at: string
  updated_at: string
  seller: {
    id: string
    first_name: string
    last_name: string
    location?: string
    bio?: string
    avatar_url?: string
    created_at: string
  }
  winner?: {
    id: string
    first_name: string
    last_name: string
    location?: string
    bio?: string
    avatar_url?: string
    created_at: string
  }
  bid_count: number
  is_active: boolean
  is_ended: boolean
  time_left: number
}

export interface Bid {
  id: string
  auctionId: string
  bidderId: number
  bidderName: string
  amount: number
  timestamp: string
  auctionTitle?: string
}

export interface CreateAuctionData {
  title: string
  description: string
  starting_price: number
  reserve_price?: number
  buy_now_price?: number
  category: string
  condition: string
  end_date: string
  images: string[]
  location: string
  shipping_cost: number
  terms?: string
}

export const useAuctionStore = defineStore('auction', () => {
  const auctions = ref<Auction[]>([])
  const currentAuction = ref<Auction | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref({
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    condition: ''
  })

  const authStore = useAuthStore()

  // Computed properties
  const activeAuctions = computed(() => 
    auctions.value.filter(auction => auction.status === 'active')
  )

  const myAuctions = computed(() => 
    auctions.value.filter(auction => auction.seller.id === authStore.user?.id)
  )

  const myBids = computed(() => {
    // This will be handled by the bids API instead
    return []
  })

  const filteredAuctions = computed(() => {
    let filtered = auctions.value

    if (filters.value.search) {
      filtered = filtered.filter(auction => 
        auction.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
        auction.description.toLowerCase().includes(filters.value.search.toLowerCase())
      )
    }

    if (filters.value.category) {
      filtered = filtered.filter(auction => auction.category === filters.value.category)
    }

    if (filters.value.status) {
      filtered = filtered.filter(auction => auction.status === filters.value.status)
    }

    if (filters.value.minPrice) {
      filtered = filtered.filter(auction => auction.current_price >= Number(filters.value.minPrice))
    }

    if (filters.value.maxPrice) {
      filtered = filtered.filter(auction => auction.current_price <= Number(filters.value.maxPrice))
    }

    if (filters.value.condition) {
      filtered = filtered.filter(auction => auction.condition === filters.value.condition)
    }

    return filtered
  })

  // Real API functions

  // Actions
  const fetchAuctions = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await auctionsAPI.getAll()
      auctions.value = response.data.auctions
      return auctions.value
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch auctions'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAuctionById = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await auctionsAPI.getById(id)
      currentAuction.value = response.data.auction
      return response.data.auction
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch auction details'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createAuction = async (auctionData: CreateAuctionData) => {
    if (!authStore.user) throw new Error('User not authenticated')
    
    loading.value = true
    error.value = null
    
    try {
      const response = await auctionsAPI.create(auctionData)
      const newAuction = response.data.auction
      auctions.value.unshift(newAuction)
      return newAuction
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create auction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAuction = async (id: string, auctionData: Partial<CreateAuctionData>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await auctionsAPI.update(id, auctionData)
      const updatedAuction = response.data.auction
      
      const index = auctions.value.findIndex(a => a.id === id)
      if (index !== -1) {
        auctions.value[index] = updatedAuction
      }
      
      return updatedAuction
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update auction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAuction = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await auctionsAPI.delete(id)
      
      const index = auctions.value.findIndex(a => a.id === id)
      if (index !== -1) {
        auctions.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete auction'
      throw err
    } finally {
      loading.value = false
    }
  }

  const placeBid = async (auctionId: string, amount: number) => {
    if (!authStore.user) throw new Error('User not authenticated')
    
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const auction = auctions.value.find(a => a.id === auctionId)
      if (!auction) throw new Error('Auction not found')
      
      if (auction.status !== 'active') throw new Error('Auction is not active')
      if (amount <= auction.currentPrice) throw new Error('Bid must be higher than current price')
      
      const newBid: Bid = {
        id: String(Date.now()),
        auctionId,
        bidderId: authStore.user.id,
        bidderName: `${authStore.user.firstName} ${authStore.user.lastName}`,
        amount,
        timestamp: new Date().toISOString()
      }
      
      auction.bids.push(newBid)
      auction.currentPrice = amount
      auction.bidCount++
      auction.totalBids++
      
      return newBid
    } catch (err) {
      error.value = 'Failed to place bid'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateFilters = (newFilters: Partial<typeof filters.value>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      category: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      condition: ''
    }
  }

  return {
    auctions,
    currentAuction,
    loading,
    error,
    filters,
    activeAuctions,
    myAuctions,
    myBids,
    filteredAuctions,
    fetchAuctions,
    fetchAuctionById,
    createAuction,
    updateAuction,
    deleteAuction,
    placeBid,
    updateFilters,
    clearFilters
  }
})
