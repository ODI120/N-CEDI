/**
 * Admin Initialization Endpoint
 * 
 * Purpose: Create the first super_admin user when no admins exist
 * Security: Only works if no admins exist; validates against brute force
 * 
 * CRITICAL: This endpoint should be:
 * - Disabled/removed after initial admin creation
 * - Protected by environment variable check
 * - Rate-limited in production
 * - Logged for audit
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

interface InitAdminRequest {
  email: string
  temporaryPassword: string
  initSecret: string // Must match ADMIN_INIT_SECRET in .env
}

const failedAttempts = new Map<string, { count: number; blockedUntil: number }>()
const MAX_ATTEMPTS = 5
const BLOCK_DURATION = 15 * 60 * 1000 // 15 minutes

export default defineEventHandler(async (event) => {
  const ipAddress = getHeader(event, 'x-forwarded-for') || 
                   getHeader(event, 'x-real-ip') ||
                   event.node.req.socket.remoteAddress ||
                   'unknown'

  // Check if IP is currently blocked
  const ipRecord = failedAttempts.get(ipAddress)
  if (ipRecord && ipRecord.blockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((ipRecord.blockedUntil - Date.now()) / (60 * 1000))
    throw createError({
      statusCode: 429,
      statusMessage: `Too many failed attempts. Setup is blocked for your IP. Try again in ${minutesLeft} minutes.`
    })
  }

  // 1. Security: Check init secret
  const allowedSecrets = [
    readLocalEnvValue('ADMIN_INIT_SECRET'),
    readLocalEnvValue('NUXT_ADMIN_INIT_SECRET'),
    process.env.ADMIN_INIT_SECRET,
    process.env.NUXT_ADMIN_INIT_SECRET,
    useRuntimeConfig().adminInitSecret
  ]
    .map(secret => secret?.trim())
    .filter((secret): secret is string => Boolean(secret))
  
  if (allowedSecrets.length === 0) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Admin initialization is not configured. Contact system administrator.'
    })
  }

  const body = await readBody<InitAdminRequest>(event)

  if (!allowedSecrets.includes(body.initSecret?.trim() || '')) {
    // Record failed attempt
    const record = failedAttempts.get(ipAddress) || { count: 0, blockedUntil: 0 }
    record.count += 1
    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = Date.now() + BLOCK_DURATION
      console.warn(`[SECURITY] IP ${ipAddress} blocked due to too many failed admin init attempts.`)
    }
    failedAttempts.set(ipAddress, record)

    // Log failed attempt
    console.warn(`[SECURITY] Failed admin init attempt from ${ipAddress} - UA: ${getHeader(event, 'user-agent') || 'unknown'}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid initialization secret.'
    })
  }

  // Reset failures on success
  failedAttempts.delete(ipAddress)

  // 2. Validation
  if (!body.email || !body.temporaryPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and temporary password are required.'
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address format.'
    })
  }

  if (body.temporaryPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Temporary password must be at least 8 characters.'
    })
  }

  try {
    const supabase = await serverSupabaseServiceRole(event) as any

    // 3. Check if any admin users exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('admin_users')
      .select('user_id', { count: 'exact' })
      .neq('role', 'viewer')

    if (checkError) {
      console.error('[ADMIN_INIT] Error checking existing admins:', checkError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Database error during admin check.'
      })
    }

    if (existingAdmins && existingAdmins.length > 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin users already exist. Use admin dashboard to manage users.'
      })
    }

    // 4. Create or reuse the auth user.
    // A previous failed setup may have created auth.users without promoting admin_users.
    const currentUser = await serverSupabaseUser(event)
    let authUser: any = await findAuthUserByEmail(supabase, body.email)
    let createdAuthUser = false

    if (!authUser && currentUser?.email?.toLowerCase() === body.email.trim().toLowerCase()) {
      authUser = currentUser
    }

    if (!authUser) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.temporaryPassword,
        email_confirm: true,
        user_metadata: { init_admin: true, created_at: new Date().toISOString() }
      })

      if (authError) {
        console.error('[ADMIN_INIT] Auth creation error:', authError)
        if (authError.message.toLowerCase().includes('already')) {
          throw createError({
            statusCode: 409,
            statusMessage: 'This email already exists in authentication. Sign in with that account, return to /admin/setup, and run setup again with the same email and initialization secret.'
          })
        }

        throw createError({
          statusCode: 500,
          statusMessage: `Failed to create user: ${authError.message}`
        })
      }

      if (!authData.user) {
        throw createError({
          statusCode: 500,
          statusMessage: 'User creation returned no user data.'
        })
      }

      authUser = authData.user
      createdAuthUser = true
    }

    // 5. Promote the admin record.
    // The auth.users trigger creates a default viewer row, so this must be idempotent.
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .upsert({
        user_id: authUser.id,
        role: 'super_admin',
        is_active: true
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (adminError) {
      console.error('[ADMIN_INIT] Admin record creation error:', adminError)
      if (createdAuthUser) {
        await supabase.auth.admin.deleteUser(authUser.id)
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create admin record.'
      })
    }

    // 6. Log successful initialization
    console.info(`[ADMIN_INIT] Super admin created: ${body.email}`)

    return {
      success: true,
      message: 'Super admin user created successfully. Please sign in to change your password.',
      user: {
        id: authUser.id,
        email: authUser.email,
        role: adminData.role
      }
    }
  } catch (err: any) {
    console.error('[ADMIN_INIT] Unexpected error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error'
    })
  }
})

async function findAuthUserByEmail(supabase: any, email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const perPage = 1000
  let page = 1

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })

    if (error) {
      console.error('[ADMIN_INIT] Auth user lookup failed:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check existing auth users.'
      })
    }

    const match = data.users.find((user: any) => user.email?.toLowerCase() === normalizedEmail)
    if (match) return match
    if (data.users.length < perPage) return null

    page += 1
  }
}

function readLocalEnvValue(key: string): string | undefined {
  try {
    const envFile = readFileSync(join(process.cwd(), '.env'), 'utf8')
    const line = envFile
      .split(/\r?\n/)
      .find(entry => entry.trim().startsWith(`${key}=`))

    if (!line) return undefined

    return line
      .slice(line.indexOf('=') + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  } catch (_e: unknown) {
    // .env file not found or unreadable — expected in some environments
    return undefined
  }
}
