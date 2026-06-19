/**
 * Client-side helper to trigger edge cache revalidation (cache purging) for Vercel ISR.
 * Authentication is handled automatically via the user's Supabase session cookie.
 */
export async function triggerRevalidation(paths: string[]): Promise<boolean> {
  if (!paths || paths.length === 0) return true

  try {
    const res = await $fetch('/api/revalidate', {
      method: 'POST',
      body: { paths }
    })
    console.info('[revalidate] Cache revalidated:', res)
    return true
  } catch (err) {
    console.warn('[revalidate] Cache revalidation failed:', err)
    return false
  }
}
