/**
 * Team members data fetching composable.
 * Used for public display of team members on site pages.
 */

import { resolveStorageRef } from '~/utils/storage'
import type { TeamMember } from '~/types'

/**
 * Fetch team members from database.
 * Returns published members ordered by display_order.
 */
export async function fetchTeamMembers(options?: { limit?: number }): Promise<TeamMember[]> {
  const supabase = useSupabaseClient()

  let query = supabase
    .from('team_members')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch team members:', error.message)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Convert snake_case from DB to camelCase and resolve avatar URLs
  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    avatarUrl: row.avatar_url ? resolveStorageRef(row.avatar_url) : undefined,
    email: row.email,
    linkedinUrl: row.linkedin_url,
    displayOrder: row.display_order,
    isPublished: row.is_published,
    createdAt: row.created_at,
  }))
}

/**
 * Use team members with reactive caching.
 * Fetches on mount, can be refreshed manually.
 */
export function useTeamMembers(limit?: number) {
  const { data, pending, refresh, error } = useAsyncData('team-members', () =>
    fetchTeamMembers({ limit }),
  )

  return {
    teamMembers: computed(() => data.value || []),
    loading: pending,
    error,
    refresh,
  }
}

/**
 * Use team members for homepage display (typically limited to 3-6).
 * Returns computed reactive teamMembers and refresh function.
 */
export function useHomepageTeamMembers(limit: number = 6) {
  const { data, pending, error } = useAsyncData('homepage-team', () =>
    fetchTeamMembers({ limit }),
  )

  return {
    teamMembers: computed(() => data.value || []),
    loading: pending,
    error,
  }
}
