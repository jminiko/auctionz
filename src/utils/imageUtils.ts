const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * Get the full URL for an uploaded image
 */
export function getImageUrl(filename: string): string {
  if (!filename) return ''

  // If it's already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }

  // If it's a data URL, return as is
  if (filename.startsWith('data:')) {
    return filename
  }

  // Otherwise, construct the URL from the backend
  return `${API_BASE_URL}/auctions/uploads/auctions/${filename}`
}

/**
 * Parse images from JSON string and return full URLs
 */
export function parseAuctionImages(imagesJson: string): string[] {
  if (!imagesJson) return []

  try {
    const images = JSON.parse(imagesJson)
    if (Array.isArray(images)) {
      return images.map((img) => getImageUrl(img))
    }
    return []
  } catch {
    return []
  }
}

/**
 * Get a thumbnail URL for an image (if needed for optimization)
 */
export function getThumbnailUrl(
  filename: string,
  size: 'small' | 'medium' | 'large' = 'medium',
): string {
  const baseUrl = getImageUrl(filename)

  // For now, return the same URL. In the future, you could implement
  // different thumbnail sizes by appending query parameters
  return baseUrl
}
