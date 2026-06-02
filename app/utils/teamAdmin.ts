/**
 * Team member admin utilities for form handling, validation, and storage.
 * Mirrors gallery, partner, and testimonial patterns for consistency.
 */

import type { TeamMember } from '~/types'
import { parseStorageRef, resolveStorageRef } from './storage'

/**
 * Form state for team member editing (add/update).
 * Matches TeamMember fields with storage reference instead of resolved URL.
 */
export interface TeamMemberFormState {
  name: string
  role: string
  bio: string
  email: string
  linkedinUrl: string
  avatarUrl: string // Storage ref: 'bucket:path' or empty
  displayOrder: number
  isPublished: boolean
}

/**
 * Form validation error object, one error per field (if invalid).
 */
export interface TeamMemberFormErrors {
  name?: string
  role?: string
  bio?: string
  email?: string
  linkedinUrl?: string
  displayOrder?: string
}

/**
 * Validate team member form.
 * Required: name, role
 * Optional: bio, email, linkedin_url, displayOrder >= 0
 */
export function validateTeamMemberForm(
  form: TeamMemberFormState,
): TeamMemberFormErrors {
  const errors: TeamMemberFormErrors = {}

  if (!form.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!form.role.trim()) {
    errors.role = 'Role is required.'
  }

  if (form.displayOrder < 0) {
    errors.displayOrder = 'Display order cannot be negative.'
  }

  return errors
}

/**
 * Convert database row to form state for editing.
 * Resolves avatar_url to display preview during edit.
 */
export function rowToTeamMemberForm(row: TeamMember): TeamMemberFormState {
  return {
    name: row.name || '',
    role: row.role || '',
    bio: row.bio || '',
    email: row.email || '',
    linkedinUrl: row.linkedinUrl || '',
    avatarUrl: row.avatarUrl || '',
    displayOrder: row.displayOrder ?? 0,
    isPublished: row.isPublished ?? true,
  }
}

/**
 * Convert form state to database insert/update payload.
 * Returns payload with snake_case field names for Supabase.
 */
export function formToTeamMemberPayload(form: TeamMemberFormState) {
  return {
    name: form.name.trim(),
    role: form.role.trim(),
    bio: form.bio.trim() || null,
    email: form.email.trim() || null,
    linkedin_url: form.linkedinUrl.trim() || null,
    avatar_url: form.avatarUrl || null,
    display_order: form.displayOrder,
    is_published: form.isPublished,
  }
}

/**
 * Parse a storage reference (bucket:path) from avatar_url.
 * Returns { bucket, path } or null if not a valid ref.
 */
export function parseTeamMemberAvatarLocation(ref: string | null | undefined): { bucket: string; path: string } | null {
  if (!ref) return null
  return parseStorageRef(ref)
}

/**
 * Resolve avatar_url to public HTTPS URL.
 * Handles storage refs, absolute URLs, and local paths.
 */
export function resolveTeamMemberAvatarUrl(ref: string | null | undefined): string {
  return resolveStorageRef(ref)
}

/**
 * Extract storage reference from a team member row for cleanup.
 * Returns storage ref (bucket:path) if avatar exists, null otherwise.
 */
export function teamMemberStorageRefForRow(row: TeamMember | null | undefined): string | null {
  if (!row?.avatarUrl) return null
  return row.avatarUrl.startsWith('teams_avatars:') || row.avatarUrl.startsWith('teams_avatars/') ? row.avatarUrl : null
}
