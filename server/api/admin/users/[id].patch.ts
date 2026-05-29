import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer'

interface UpdateAdminRequest {
  role?: AdminRole
  is_active?: boolean
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseServiceRole(event) as any
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required.'
    })
  }

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

  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required.'
    })
  }

  if (userId !== user.id && adminRecord.role !== 'super_admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot update other users.'
    })
  }

  const body = await readBody<UpdateAdminRequest>(event)
  const updates: Partial<UpdateAdminRequest> = {}

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
    .select('user_id, role, is_active, created_at, updated_at')
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
})
