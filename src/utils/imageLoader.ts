/**
 * Centralized image management for VOLTA
 * Ensures consistent image handling with proper fallbacks
 */

export const IMAGE_CONFIG = {
  PLACEHOLDERS: {
    equipment: '/images/placeholders/equipment.svg',
    category: '/images/placeholders/category.svg',
    profile: '/images/placeholders/profile.svg',
  },
  FALLBACK_DATA_URI:
    'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e2e8f0%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%2364748b%22%3EÉquipement%3C/text%3E%3C/svg%3E',
  // Image sources in order of preference
  IMAGE_SOURCES: {
    primary: (seed: string) => `https://loremflickr.com/640/420?random=${seed}`,
    secondary: (seed: string) => `https://picsum.photos/seed/${seed}/640/420`,
    fallback: (type: 'equipment' | 'category' | 'profile' = 'equipment') => {
      return IMAGE_CONFIG.PLACEHOLDERS[type]
    },
  },
}

/**
 * Get image URL with fallback chain
 * 1. Primary URL (loremflickr)
 * 2. Secondary URL (picsum.photos)
 * 3. Placeholder SVG
 * 4. Data URI fallback
 */
export function getImageUrl(
  originalUrl: string | undefined,
  type: 'equipment' | 'category' | 'profile' = 'equipment'
): string {
  if (!originalUrl) {
    return IMAGE_CONFIG.PLACEHOLDERS[type]
  }
  return originalUrl
}

/**
 * Handle image errors with proper fallback
 */
export function handleImageError(
  event: { target: HTMLImageElement },
  type: 'equipment' | 'category' | 'profile' = 'equipment'
): void {
  const img = event.target as HTMLImageElement

  // Prevent infinite loops - track attempts
  const imageAny = img as any
  const attempts = (imageAny.__errorAttempts || 0) as number
  imageAny.__errorAttempts = attempts + 1

  // Try placeholders first, then data URI
  const fallbacks = [
    IMAGE_CONFIG.PLACEHOLDERS[type],
    IMAGE_CONFIG.FALLBACK_DATA_URI,
  ]

  if (attempts < fallbacks.length) {
    img.src = fallbacks[attempts]
  }
}

/**
 * Preload images to ensure they load before display
 */
export async function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Get responsive image srcset
 */
export function getImageSrcSet(baseUrl: string): string {
  if (!baseUrl || baseUrl.startsWith('data:')) {
    return baseUrl
  }
  // Return base URL (services like loremflickr handle sizing)
  return baseUrl
}
