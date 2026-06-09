/**
 * Admin Users Collection API
 * 
 * Endpoints:
 * - GET  /api/admin/users - List all admin users (editor+ only)
 * - POST /api/admin/users - Enroll a new admin user (super_admin only)
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { webcrypto } from 'node:crypto'

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

interface ListAdminsResponse {
  success: boolean
  data: Array<{
    user_id: string
    email: string
    role: AdminRole
    is_active: boolean
    created_at: string
    updated_at: string
  }>
}

interface CreateAdminRequest {
  email: string
  role: AdminRole
  temporaryPassword?: string
}

export default defineEventHandler(async (event): Promise<any> => {
  const supabase = await serverSupabaseServiceRole(event) as any
  const user = await serverSupabaseUser(event)

  // 1. Require authentication
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required.'
    })
  }

  // 2. Check caller permission
  const { data: adminRecord, error: adminCheckError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id || (user as any).sub)
    .maybeSingle()

  if (adminCheckError || !adminRecord || !adminRecord.is_active) {
    console.error('[ADMIN_API_DEBUG] --- AUTH CHECK FAILED ---')
    console.error('[ADMIN_API_DEBUG] Authenticated User ID:', user.id)
    console.error('[ADMIN_API_DEBUG] Authenticated User Email:', user.email)
    console.error('[ADMIN_API_DEBUG] adminCheckError:', adminCheckError)
    console.error('[ADMIN_API_DEBUG] adminRecord:', adminRecord)
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions.'
    })
  }

  const method = getMethod(event)

  // ─────────────────────────────────────────────────────────────
  // GET /api/admin/users - List all admin users
  // ─────────────────────────────────────────────────────────────
  if (method === 'GET') {
    // Requires super_admin role
    if (adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to list admins.'
      })
    }

    const { data: admins, error: listError } = await supabase
      .from('admin_users')
      .select('user_id, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (listError) {
      console.error('[ADMIN_API] Error listing admins:', listError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch admin users.'
      })
    }

    // Retrieve auth.users to map user_id -> email
    let allAuthUsers: any[] = []
    try {
      allAuthUsers = await fetchAllAuthUsers(supabase)
    } catch (authError) {
      console.error('[ADMIN_API] Error fetching auth users:', authError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to retrieve user email mappings.'
      })
    }

    const userEmailMap = new Map(allAuthUsers.map(u => [u.id, u.email]))

    return {
      success: true,
      data: admins.map((admin: any) => ({
        ...admin,
        email: userEmailMap.get(admin.user_id) || 'unknown'
      }))
    } as ListAdminsResponse
  }

  // ─────────────────────────────────────────────────────────────
  // POST /api/admin/users - Enroll new admin
  // ─────────────────────────────────────────────────────────────
  if (method === 'POST') {
    // Requires super_admin role
    if (adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can enroll new admin users.'
      })
    }

    const body = await readBody<CreateAdminRequest>(event)

    if (!body.email || !body.role) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and role are required.'
      })
    }

    const validRoles: AdminRole[] = ['super_admin', 'admin', 'editor', 'viewer']
    if (!validRoles.includes(body.role)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid role. Must be one of: ${validRoles.join(', ')}`
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email address format.'
      })
    }

    // Check if user already exists in auth.users
    const existingUser = await findAuthUserByEmail(supabase, body.email)
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists.'
      })
    }

    const tempPassword = body.temporaryPassword || generateSecurePassword()

    // Create auth user
    const { data: newAuthUser, error: authCreateError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        enrolled_by: user.email,
        enrolled_at: new Date().toISOString()
      }
    })

    if (authCreateError) {
      console.error('[ADMIN_API] Auth user creation failed:', authCreateError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create user account: ${authCreateError.message}`
      })
    }

    // Insert/upsert into admin_users (to handle trigger race-conditions)
    const { data: newAdmin, error: adminCreateError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: newAuthUser.user?.id,
        role: body.role,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (adminCreateError) {
      console.error('[ADMIN_API] Admin record promotion failed:', adminCreateError)
      // Rollback auth user creation
      await supabase.auth.admin.deleteUser(newAuthUser.user!.id)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create administrative record.'
      })
    }

    console.info(`[ADMIN_API] New admin enrolled: ${body.email} with role ${body.role} by ${user.email}`)

    return {
      success: true,
      message: 'Admin user enrolled successfully.',
      user: {
        user_id: newAdmin.user_id,
        email: body.email,
        role: newAdmin.role,
        temporary_password: tempPassword
      }
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed.'
  })
})

// Helper functions

function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  const randomValues = new Uint8Array(length)
  webcrypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[(randomValues[i] ?? 0) % chars.length]
  }
  return result
}

async function findAuthUserByEmail(supabase: any, email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const perPage = 1000
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('[ADMIN_API] Auth user lookup failed:', error)
      throw error
    }
    if (!data?.users || data.users.length === 0) break

    const match = data.users.find((u: { email?: string | null }) => u.email?.toLowerCase() === normalizedEmail)
    if (match) return match
    if (data.users.length < perPage) break

    page += 1
  }
  return null
}

async function fetchAllAuthUsers(supabase: any): Promise<any[]> {
  const allUsers: any[] = []
  const perPage = 1000
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error('[ADMIN_API] Error fetching auth users page:', error)
      throw error
    }
    if (!data?.users || data.users.length === 0) break

    allUsers.push(...data.users)
    if (data.users.length < perPage) break

    page += 1
  }

  return allUsers
}
