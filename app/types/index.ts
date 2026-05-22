/**
 * N-CEDI — TypeScript interfaces
 *
 * Every interface maps 1-to-1 to a Supabase table.
 * Column names are converted from snake_case (DB) to camelCase (TS).
 */

// ───────────────────────────────────────────────
// Lookup / reference tables
// ───────────────────────────────────────────────

export interface Category {
  id: string
  slug: string
  name: string
  type: 'blog' | 'gallery' | 'event' | 'program'
  createdAt: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  avatarUrl?: string
  email?: string
  linkedinUrl?: string
  displayOrder: number
  isPublished: boolean
  createdAt: string
}

// ───────────────────────────────────────────────
// Core content tables
// ───────────────────────────────────────────────

export interface Program {
  id: string
  slug: string
  title: string
  subtitle?: string
  description: string
  body?: Record<string, unknown>[]
  durationWeeks: number
  level: 'beginner' | 'intermediate' | 'advanced'
  isFeatured: boolean
  isPublished: boolean
  coverImageUrl: string
  galleryUrls: string[]
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string
  body?: Record<string, unknown>[]
  eventType: 'workshop' | 'seminar' | 'exhibition' | 'competition' | 'open_day'
  startsAt: string
  endsAt?: string
  location?: string
  isVirtual: boolean
  meetingUrl?: string
  coverImageUrl: string
  capacity?: number
  registrationUrl?: string
  isPublished: boolean
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  body?: Record<string, unknown>[]
  authorId: string
  categoryId: string
  coverImageUrl: string
  readTimeMinutes: number
  isFeatured: boolean
  isPublished: boolean
  publishedAt: string
  metaTitle?: string
  metaDescription?: string
  createdAt: string
  updatedAt: string
  author?: Pick<TeamMember, 'name' | 'avatarUrl' | 'role'>
  category?: Pick<Category, 'name' | 'slug'>
}

export interface Testimonial {
  id: string
  name: string
  role?: string
  organization?: string
  quote: string
  avatarUrl?: string
  programId?: string
  rating: number
  isFeatured: boolean
  isPublished: boolean
  createdAt: string
}

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  studentName: string
  programId: string
  mediaUrls: string[]
  tags: string[]
  year: number
  isFeatured: boolean
  isPublished: boolean
  createdAt: string
}

export interface Partner {
  id: string
  name: string
  websiteUrl?: string
  logoUrl: string
  tier: 'platinum' | 'gold' | 'silver' | 'community'
  isActive: boolean
  displayOrder: number
  createdAt: string
}

export interface GalleryItem {
  id: string
  title?: string
  mediaUrl: string
  mediaType: 'image' | 'video'
  altText?: string
  categoryId?: string
  eventId?: string
  programId?: string
  isPublished: boolean
  displayOrder: number
  createdAt: string
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  type: 'general' | 'partnership' | 'enrollment' | 'media'
  isRead: boolean
  createdAt: string
}

// ───────────────────────────────────────────────
// Utility / generic types
// ───────────────────────────────────────────────

/** Supabase list response shape used by composables */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
}

/** Common query filters reused across composables */
export interface ListQueryOptions {
  page?: number
  perPage?: number
  search?: string
  orderBy?: string
  ascending?: boolean
}
