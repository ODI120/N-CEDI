/**
 * Admin User Detail API
 * 
 * Endpoints:
 * - PATCH  /api/admin/users/[id] - Update admin role/status (super_admin only)
 * - DELETE /api/admin/users/[id] - Delete/enrollment rollback of admin user (super_admin only)
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

interface UpdateAdminRequest {
  role?: AdminRole
  is_active?: boolean
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
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions.'
    })
  }

  const targetUserId = getRouterParam(event, 'id')
  if (!targetUserId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Target User ID is required.'
    })
  }

  const method = getMethod(event)

  // ─────────────────────────────────────────────────────────────
  // GET /api/admin/users/[id] - Get admin user details
  // ─────────────────────────────────────────────────────────────
  if (method === 'GET') {
    const currentUserId = user.id || (user as any).sub
    // Only super_admin or the user themselves can view details
    if (adminRecord.role !== 'super_admin' && currentUserId !== targetUserId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Insufficient permissions to view administrator details.'
      })
    }

    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('user_id, role, is_active, created_at, updated_at')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (fetchError || !admin) {
      console.error(`[ADMIN_API] Admin fetch failed for ${targetUserId}:`, fetchError)
      throw createError({
        statusCode: 404,
        statusMessage: 'Admin user not found.'
      })
    }

    // Fetch user email from auth
    let email = 'unknown'
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(targetUserId)
    if (authError) {
      console.error(`[ADMIN_API] Error fetching email from auth for ${targetUserId}:`, authError.message)
    } else if (authUser?.user) {
      email = authUser.user.email || 'unknown'
    }

    return {
      success: true,
      data: {
        ...admin,
        email
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // PATCH /api/admin/users/[id] - Update admin user
  // ─────────────────────────────────────────────────────────────
  if (method === 'PATCH') {
    // Only super_admin can change status or roles
    if (adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can modify administrator records.'
      })
    }

    const body = await readBody<UpdateAdminRequest>(event)
    const updates: any = {}

    if (body.role !== undefined) {
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
      // Prevent self-deactivation
      if (targetUserId === (user.id || (user as any).sub) && !body.is_active) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cannot deactivate your own account.'
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

    // Apply updates and set updated_at timestamp
    const { data: updatedAdmin, error: updateError } = await supabase
      .from('admin_users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId)
      .select('user_id, role, is_active, created_at, updated_at')
      .single()

    if (updateError) {
      console.error(`[ADMIN_API] Admin update failed for ${targetUserId}:`, updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update admin user record.'
      })
    }

    console.info(`[ADMIN_API] Admin updated: ${targetUserId} - changes: ${JSON.stringify(updates)} by ${user.email}`)

    return {
      success: true,
      message: 'Admin user updated successfully.',
      user: updatedAdmin
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE /api/admin/users/[id] - Delete admin user
  // ─────────────────────────────────────────────────────────────
  if (method === 'DELETE') {
    // Only super_admin can delete admins
    if (adminRecord.role !== 'super_admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Only super_admin can delete admin accounts.'
      })
    }

    // Prevent self-deletion
    if (targetUserId === (user.id || (user as any).sub)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete your own account.'
      })
    }

    // Delete user from auth schema (this cascade deletes from public.admin_users)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
      console.error(`[ADMIN_API] Admin deletion failed for ${targetUserId}:`, deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete admin user: ${deleteError.message}`
      })
    }

    console.warn(`[ADMIN_API] Admin account deleted: ${targetUserId} by ${user.email}`)

    return {
      success: true,
      message: 'Admin user deleted successfully.'
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed.'
  })
})
