import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { paths, secret } = body || {}

  if (!paths || !Array.isArray(paths)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid paths array'
    })
  }

  let isAuthorized = false

  // Check 1: Shared secret token
  const config = useRuntimeConfig()
  const expectedSecret = process.env.REVALIDATE_SECRET || config.adminInitSecret
  if (secret && expectedSecret && secret === expectedSecret) {
    isAuthorized = true
  }

  // Check 2: Active admin user session
  if (!isAuthorized) {
    try {
      const user = await serverSupabaseUser(event)
      if (user) {
        const supabase = await serverSupabaseServiceRole(event) as any
        const { data: adminRecord } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('user_id', user.id || (user as any).sub)
          .maybeSingle()

        if (adminRecord && adminRecord.is_active) {
          isAuthorized = true
        }
      }
    } catch (err) {
      console.warn('[revalidate] Supabase session check warning:', err)
    }
  }

  if (!isAuthorized) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized. Valid admin session or secret required.'
    })
  }

  const bypassToken = process.env.PRERENDER_BYPASS_TOKEN || process.env.BYPASS_TOKEN
  if (!bypassToken) {
    return {
      success: true,
      message: 'Bypassed Vercel revalidation (local development or token missing)',
      results: paths.map((path) => ({ path, status: 'skipped' }))
    }
  }

  const results = []
  const req = event.node.req
  const protocol = (req.headers['x-forwarded-proto'] as string) || 'https'
  const host = (req.headers.host as string) || 'localhost:3000'
  const origin = `${protocol}://${host}`

  for (const path of paths) {
    const cleanPath = '/' + path.replace(/^\/+/, '')
    const targetUrl = `${origin}${cleanPath}`
    try {
      await $fetch(targetUrl, {
        headers: {
          'x-prerender-revalidate': bypassToken
        }
      })
      results.push({ path: cleanPath, status: 'success' })
    } catch (err: any) {
      results.push({ path: cleanPath, status: 'failed', error: err.message })
    }
  }

  return { success: true, results }
})
