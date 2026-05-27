export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  // Allow the login route without checks.
  if (to.path === '/admin/login') return

  const user = useSupabaseUser()

  // Wait a tick for Supabase session hydration on client.
  // In Nuxt client-only admin routes, this avoids redirect flicker.
  if (import.meta.client && user.value === undefined) {
    await nextTick()
  }

  if (!user.value) {
    return navigateTo(`/admin/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Admin membership check via `admin_users` (RLS-protected; user can read own row).
  const supabase = useSupabaseClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.value.id)
    .maybeSingle()

  if (error || !data || data.is_active !== true) {
    return navigateTo('/admin/login?reason=not_admin')
  }
})
