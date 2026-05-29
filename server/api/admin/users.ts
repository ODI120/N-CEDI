/**
 * Admin Users Management API
 * 
 * Endpoints:
 * - GET /api/admin/users - List all admin users (admin+ only)
 * - POST /api/admin/users - Create/enroll new admin (super_admin only)
 * - PATCH /api/admin/users/[id] - Update admin user (admin+ only)
 * - DELETE /api/admin/users/[id] - Deactivate admin (super_admin only)
 * 
 * Security:
 * - All endpoints require authentication
 * - Role-based access control enforced
 * - Audit logging for all changes
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

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
  error?: string
}

interface CreateAdminRequest {
  email: string
  role: AdminRole
  temporaryPassword?: string
}

interface UpdateAdminRequest {
  role?: AdminRole
  is_active?: boolean
}

export default defineEventHandler(async (event): Promise<any> => {
  const supabase = await serverSupabaseServiceRole(event)
  const user = await serverSupabaseUser(event)

  // Require authentication
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required.'
    })
  }

  // Check if user has admin access
  const { data: adminRecord, error: adminCheckError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminCheckError || !adminRecord || !adminRecord.is_active) {
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
    // Require editor role or higher
    if (!['super_admin', 'admin', 'editor'].includes(adminRecord.role)) {
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

    // Join with auth users to get emails
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('[ADMIN_API] Error fetching auth users:', authError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user emails.'
      })
    }

    const userEmailMap = new Map(authUsers.users.map(u => [u.id, u.email]))

    return {
      success: true,
      data: admins.map(admin => ({
        ...admin,
        email: userEmailMap.get(admin.user_id) || 'unknown'
      }))
    } as ListAdminsResponse
  }

  // ─────────────────────────────────────────────────────────────
  // POST /api/admin/users - Create/enroll new admin
  // ─────────────────────────────────────────────────────────────
  if (method === 'POST') {
    // Require super_admin role
    if (adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can create admin users.'
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

    const existingUser = await findAuthUserByEmail(supabase, body.email)

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User with this email already exists.'
      })
    }

    // Create auth user (temporary password)
    const tempPassword = body.temporaryPassword || generateSecurePassword()

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
        statusMessage: `Failed to create user: ${authCreateError.message}`
      })
    }

    // Promote the admin record.
    // The auth.users trigger may already have inserted a default viewer row.
    const { data: newAdmin, error: adminCreateError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: newAuthUser.user?.id,
        role: body.role,
        is_active: true
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (adminCreateError) {
      console.error('[ADMIN_API] Admin record creation failed:', adminCreateError)
      // Clean up auth user
      await supabase.auth.admin.deleteUser(newAuthUser.user!.id)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create admin record.'
      })
    }

    // Log the action
    console.info(`[ADMIN_API] New admin enrolled: ${body.email} with role ${body.role} by ${user.email}`)

    return {
      success: true,
      message: 'Admin user created successfully.',
      user: {
        user_id: newAdmin.user_id,
        email: body.email,
        role: newAdmin.role,
        temporary_password: tempPassword
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PATCH /api/admin/users/[id] - Update admin user
  // ─────────────────────────────────────────────────────────────
  if (method === 'PATCH') {
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required.'
      })
    }

    // Only super_admin can update others; users can update self
    if (userId !== user.id && adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Cannot update other users.'
      })
    }

    const body = await readBody<UpdateAdminRequest>(event)

    const updates: any = {}

    if (body.role !== undefined) {
      if (adminRecord.role !== 'super_admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Only super_admin can change roles.'
        })
      }

      const validRoles: AdminRole[] = ['super_admin', 'admin', 'editor', 'viewer']
      if (!validRoles.includes(body.role)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Invalid role. Must be one of: ${validRoles.join(', ')}`
        })
      }

      updates.role = body.role
    }

    if (body.is_active !== undefined) {
      if (adminRecord.role !== 'super_admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Only super_admin can deactivate users.'
        })
      }

      updates.is_active = body.is_active
    }

    if (Object.keys(updates).length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No updates provided.'
      })
    }

    const { data: updatedAdmin, error: updateError } = await supabase
      .from('admin_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('[ADMIN_API] Admin update failed:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update admin user.'
      })
    }

    console.info(`[ADMIN_API] Admin updated: ${userId} - changes: ${JSON.stringify(updates)} by ${user.email}`)

    return {
      success: true,
      message: 'Admin user updated successfully.',
      user: updatedAdmin
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE /api/admin/users/[id] - Deactivate admin
  // ─────────────────────────────────────────────────────────────
  if (method === 'DELETE') {
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required.'
      })
    }

    // Only super_admin can delete
    if (adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can deactivate users.'
      })
    }

    // Prevent deactivating self
    if (userId === user.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot deactivate your own account.'
      })
    }

    // Soft delete: set is_active to false
    const { error: deleteError } = await supabase
      .from('admin_users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (deleteError) {
      console.error('[ADMIN_API] Admin deactivation failed:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to deactivate admin user.'
      })
    }

    console.warn(`[ADMIN_API] Admin deactivated: ${userId} by ${user.email}`)

    return {
      success: true,
      message: 'Admin user deactivated successfully.'
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed.'
  })
})

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

function generateSecurePassword(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
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
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing auth users.'
      })
    }

    const match = data.users.find((user: { email?: string | null }) => user.email?.toLowerCase() === normalizedEmail)
    if (match) return match
    if (data.users.length < perPage) return null

    page += 1
  }
}
