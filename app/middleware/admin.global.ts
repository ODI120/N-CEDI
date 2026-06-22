export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  // Allow login and setup routes without auth checks
  if (to.path === '/admin/login' || to.path === '/admin/setup') return

  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Wait briefly for Supabase session hydration on client-side admin routes.
  if (import.meta.client && !user.value?.id) {
    await nextTick()
  }

  const userId = user.value?.id || (await supabase.auth.getUser()).data.user?.id

  if (!userId) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Admin membership check via `admin_users` (RLS-protected; user can read own row).
  const { data, error } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[admin.global] Admin lookup failed:', error.message)
    return navigateTo('/admin/login?reason=error')
  }

  if (!data || data.is_active !== true) {
    return navigateTo('/admin/login?reason=not_admin')
  }
})
