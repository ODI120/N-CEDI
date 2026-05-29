import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

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

  if (adminRecord.role !== 'super_admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Only super_admin can deactivate users.'
    })
  }

  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required.'
    })
  }

  if (userId === user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot deactivate your own account.'
    })
  }

  const { error: deleteError } = await supabase
    .from('admin_users')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
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
})
