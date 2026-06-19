import type { StorageBucketId } from './storage'

interface ProcessOptions {
  maxWidth: number
  maxHeight: number
  quality: number
}

function getProcessOptionsForBucket(bucket: StorageBucketId): ProcessOptions {
  switch (bucket) {
    case 'teams_avatars':
    case 'testimonial_avatars':
      return { maxWidth: 200, maxHeight: 200, quality: 0.85 }
    case 'site_assets':
      return { maxWidth: 400, maxHeight: 400, quality: 0.85 }
    case 'program_media':
      return { maxWidth: 1200, maxHeight: 800, quality: 0.82 }
    case 'media':
      return { maxWidth: 1200, maxHeight: 800, quality: 0.82 }
    case 'gallery_media':
      return { maxWidth: 1600, maxHeight: 1200, quality: 0.80 }
    default:
      return { maxWidth: 1200, maxHeight: 1200, quality: 0.82 }
  }
}

/**
 * Resizes, converts to WebP, and compresses an image file in the browser.
 * If the file is not an image, returns it unchanged.
 */
export async function processImageBeforeUpload(
  file: File,
  bucket: StorageBucketId
): Promise<File> {
  // Only process standard browser-supported images
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file
  }

  const { maxWidth, maxHeight, quality } = getProcessOptionsForBucket(bucket)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect ratio resizing
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(file)
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }

            // Create a new file with .webp extension
            const originalName = file.name
            const lastDotIndex = originalName.lastIndexOf('.')
            const baseName = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName
            const webpName = `${baseName}.webp`

            const processedFile = new File([blob], webpName, {
              type: 'image/webp',
              lastModified: Date.now()
            })

            resolve(processedFile)
          },
          'image/webp',
          quality
        )
      }
      img.onerror = () => {
        resolve(file) // Fallback to original file on load error
      }
    }
    reader.onerror = () => {
      resolve(file) // Fallback to original file on read error
    }
  })
}
