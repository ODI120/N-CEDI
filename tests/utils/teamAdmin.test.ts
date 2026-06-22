import { describe, it, expect, vi } from 'vitest'

import {
  validateTeamMemberForm,
  rowToTeamMemberForm,
  formToTeamMemberPayload,
  parseTeamMemberAvatarLocation,
  teamMemberStorageRefForRow,
  type TeamMemberFormState
} from '~/utils/teamAdmin'
import type { TeamMember } from '~/types'

vi.stubGlobal('useSupabaseClient', () => ({
  storage: { from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
}))
vi.stubGlobal('useRuntimeConfig', () => ({ public: { supabaseUrl: '' } }))

describe('validateTeamMemberForm', () => {
  it('returns no errors for valid form', () => {
    const form: TeamMemberFormState = {
      name: 'John', role: 'Director', bio: '', email: '',
      linkedinUrl: '', avatarUrl: '', displayOrder: 0, isPublished: true
    }
    expect(Object.keys(validateTeamMemberForm(form))).toHaveLength(0)
  })

  it('requires name', () => {
    const form: TeamMemberFormState = {
      name: '', role: 'Director', bio: '', email: '',
      linkedinUrl: '', avatarUrl: '', displayOrder: 0, isPublished: true
    }
    expect(validateTeamMemberForm(form).name).toBe('Name is required.')
  })

  it('requires role', () => {
    const form: TeamMemberFormState = {
      name: 'John', role: '', bio: '', email: '',
      linkedinUrl: '', avatarUrl: '', displayOrder: 0, isPublished: true
    }
    expect(validateTeamMemberForm(form).role).toBe('Role is required.')
  })

  it('rejects negative display order', () => {
    const form: TeamMemberFormState = {
      name: 'John', role: 'Director', bio: '', email: '',
      linkedinUrl: '', avatarUrl: '', displayOrder: -1, isPublished: true
    }
    expect(validateTeamMemberForm(form).displayOrder).toBe('Display order cannot be negative.')
  })

  it('accepts zero display order', () => {
    const form: TeamMemberFormState = {
      name: 'John', role: 'Director', bio: '', email: '',
      linkedinUrl: '', avatarUrl: '', displayOrder: 0, isPublished: true
    }
    expect(validateTeamMemberForm(form).displayOrder).toBeUndefined()
  })
})

describe('rowToTeamMemberForm', () => {
  it('maps TeamMember to form state', () => {
    const member: TeamMember = {
      id: '1', name: 'Jane', role: 'Engineer', bio: 'A bio',
      avatarUrl: 'teams_avatars:avatar.jpg', email: 'jane@example.com',
      linkedinUrl: 'https://linkedin.com/in/jane', displayOrder: 2,
      isPublished: true, createdAt: '2024-01-01'
    }
    const form = rowToTeamMemberForm(member)
    expect(form.name).toBe('Jane')
    expect(form.role).toBe('Engineer')
    expect(form.bio).toBe('A bio')
    expect(form.email).toBe('jane@example.com')
    expect(form.avatarUrl).toBe('teams_avatars:avatar.jpg')
    expect(form.displayOrder).toBe(2)
  })

  it('defaults undefined fields to empty', () => {
    const member: TeamMember = {
      id: '1', name: 'Jane', role: 'Engineer',
      displayOrder: 0, isPublished: true, createdAt: '2024-01-01'
    }
    const form = rowToTeamMemberForm(member)
    expect(form.bio).toBe('')
    expect(form.email).toBe('')
    expect(form.linkedinUrl).toBe('')
    expect(form.avatarUrl).toBe('')
  })
})

describe('formToTeamMemberPayload', () => {
  it('converts form to db payload', () => {
    const form: TeamMemberFormState = {
      name: '  Jane Doe  ', role: '  Engineer  ', bio: '  A bio  ',
      email: '  jane@example.com  ', linkedinUrl: '  https://linkedin.com  ',
      avatarUrl: 'teams_avatars:avatar.jpg', displayOrder: 1, isPublished: true
    }
    const payload = formToTeamMemberPayload(form)
    expect(payload.name).toBe('Jane Doe')
    expect(payload.role).toBe('Engineer')
    expect(payload.bio).toBe('A bio')
    expect(payload.email).toBe('jane@example.com')
    expect(payload.linkedin_url).toBe('https://linkedin.com')
    expect(payload.avatar_url).toBe('teams_avatars:avatar.jpg')
  })

  it('sets empty optional fields to null', () => {
    const form: TeamMemberFormState = {
      name: 'Jane', role: 'Engineer', bio: '', email: '',
      linkedinUrl: '', avatarUrl: '', displayOrder: 0, isPublished: true
    }
    const payload = formToTeamMemberPayload(form)
    expect(payload.bio).toBeNull()
    expect(payload.email).toBeNull()
    expect(payload.linkedin_url).toBeNull()
    expect(payload.avatar_url).toBeNull()
  })
})

describe('parseTeamMemberAvatarLocation', () => {
  it('parses valid storage ref', () => {
    expect(parseTeamMemberAvatarLocation('teams_avatars:avatars/photo.jpg'))
      .toEqual({ bucket: 'teams_avatars', path: 'avatars/photo.jpg' })
  })

  it('returns null for null/undefined', () => {
    expect(parseTeamMemberAvatarLocation(null)).toBeNull()
    expect(parseTeamMemberAvatarLocation(undefined)).toBeNull()
  })

  it('returns null for non-storage ref', () => {
    expect(parseTeamMemberAvatarLocation('https://example.com/photo.jpg')).toBeNull()
  })
})

describe('teamMemberStorageRefForRow', () => {
  it('returns storage ref for teams_avatars: prefix', () => {
    const member: TeamMember = {
      id: '1', name: 'Jane', role: 'Eng', avatarUrl: 'teams_avatars:avatar.jpg',
      displayOrder: 0, isPublished: true, createdAt: ''
    }
    expect(teamMemberStorageRefForRow(member)).toBe('teams_avatars:avatar.jpg')
  })

  it('returns storage ref for teams_avatars/ prefix', () => {
    const member: TeamMember = {
      id: '1', name: 'Jane', role: 'Eng', avatarUrl: 'teams_avatars/avatar.jpg',
      displayOrder: 0, isPublished: true, createdAt: ''
    }
    expect(teamMemberStorageRefForRow(member)).toBe('teams_avatars/avatar.jpg')
  })

  it('returns null for non-teams_avatars ref', () => {
    const member: TeamMember = {
      id: '1', name: 'Jane', role: 'Eng', avatarUrl: 'media:avatar.jpg',
      displayOrder: 0, isPublished: true, createdAt: ''
    }
    expect(teamMemberStorageRefForRow(member)).toBeNull()
  })

  it('returns null for null/undefined row', () => {
    expect(teamMemberStorageRefForRow(null)).toBeNull()
    expect(teamMemberStorageRefForRow(undefined)).toBeNull()
  })

  it('returns null for missing avatarUrl', () => {
    const member: TeamMember = {
      id: '1', name: 'Jane', role: 'Eng',
      displayOrder: 0, isPublished: true, createdAt: ''
    }
    expect(teamMemberStorageRefForRow(member)).toBeNull()
  })
})
