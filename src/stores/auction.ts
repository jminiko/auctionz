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
  amount: number
  status: string
  created_at: string
  auction_id: string
  auction_title?: string
  auction_image?: string
  auction_end_date?: string
  bidder?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  is_winning: boolean
  is_outbid: boolean
}

export interface CreateAuctionData {
  title: string
  description: string
  starting_price: number
  reserve_price?: number
  buy_now_price?: number
  category: string
  condition: string
  duration: number
  end_date: string
  images: File[]
  location: string
  shipping_cost: number
  terms?: string
}

export const useAuctionStore = defineStore('auction', () => {
  const auctions = ref<Auction[]>([])
  const currentAuction = ref<Auction | null>(null)
  const loading = ref(false)
  const myBids = ref<Bid[]>([])
  const error = ref<string | null>(null)
  const filters = ref({
    search: '',
    category: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    condition: '',
  })

  const authStore = useAuthStore()

  // Computed properties
  const activeAuctions = computed(() =>
    auctions.value.filter((auction) => auction.status === 'active' || auction.status === 'pending'),
  )

  const myAuctions = computed(() =>
    auctions.value.filter((auction) => auction.seller.id === authStore.user?.id),
  )

  const fetchMyBids = async (auctionId: string) => {
    loading.value = true
    error.value = null
    console.log('DBG00100:::', auctionId)
    try {
      const response = await auctionsAPI.getBids(auctionId) // Fixed: use auctionsAPI.getBids instead of bidsAPI.getMyBids
      console.log('DBG00200:::', response)
      myBids.value = response.data.bids || [] // Fixed: use 'bids' instead of 'myBids'
      console.log('DBG00300:::', myBids.value)
      return myBids.value
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch my bids'
      throw err
    } finally {
      loading.value = false
    }
  }

  const filteredAuctions = computed(() => {
    let filtered = auctions.value

    if (filters.value.search) {
      filtered = filtered.filter(
        (auction) =>
          auction.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          auction.description.toLowerCase().includes(filters.value.search.toLowerCase()),
      )
    }

    if (filters.value.category) {
      filtered = filtered.filter((auction) => auction.category === filters.value.category)
    }

    if (filters.value.status) {
      filtered = filtered.filter((auction) => auction.status === filters.value.status)
    }

    if (filters.value.minPrice) {
      filtered = filtered.filter(
        (auction) => auction.current_price >= Number(filters.value.minPrice),
      )
    }

    if (filters.value.maxPrice) {
      filtered = filtered.filter(
        (auction) => auction.current_price <= Number(filters.value.maxPrice),
      )
    }

    if (filters.value.condition) {
      filtered = filtered.filter((auction) => auction.condition === filters.value.condition)
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

      // Also fetch bids for this auction
      try {
        const bidsResponse = await auctionsAPI.getBids(id)
        myBids.value = bidsResponse.data.bids || []
      } catch (bidsError) {
        console.warn('Failed to fetch bids:', bidsError)
        myBids.value = []
      }

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
      // Create FormData for file upload
      const formData = new FormData()

      // Add text fields
      formData.append('title', auctionData.title)
      formData.append('description', auctionData.description)
      formData.append('category', auctionData.category)
      formData.append('condition', auctionData.condition)
      formData.append('starting_price', auctionData.starting_price.toString())
      formData.append('duration', auctionData.duration.toString())
      formData.append('location', auctionData.location)
      formData.append('shipping_cost', auctionData.shipping_cost.toString())

      // Add optional fields
      if (auctionData.reserve_price) {
        formData.append('reserve_price', auctionData.reserve_price.toString())
      }
      if (auctionData.buy_now_price) {
        formData.append('buy_now_price', auctionData.buy_now_price.toString())
      }
      if (auctionData.terms) {
        formData.append('terms', auctionData.terms)
      }

      // Add image files
      if (auctionData.images && auctionData.images.length > 0) {
        auctionData.images.forEach((image) => {
          formData.append('images', image)
        })
      }

      // Make API call with FormData
      const response = await auctionsAPI.create(formData)
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

      const index = auctions.value.findIndex((a) => a.id === id)
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

      const index = auctions.value.findIndex((a) => a.id === id)
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
      // Call the actual API with proper data structure
      const response = await bidsAPI.placeBid(auctionId, { amount })

      // Update the current auction if it's the one being bid on
      if (currentAuction.value?.id === auctionId) {
        await fetchAuctionById(auctionId)
      }

      // Update the auction in the list if it exists
      const auctionIndex = auctions.value.findIndex((a) => a.id === auctionId)
      if (auctionIndex !== -1) {
        await fetchAuctions() // Refresh the list
      }

      return response
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to place bid'
      error.value = errorMessage
      throw new Error(errorMessage)
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
      condition: '',
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
    clearFilters,
  }
})
