import { serverSupabaseServiceRole } from '#supabase/server'

interface ContactRequestBody {
  name: string
  email: string
  message: string
  phone?: string
  subject?: string
  type?: 'general' | 'partnership' | 'enrollment' | 'media'
}

// Simple in-memory rate limiter: max 5 submissions per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number, resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes

export default defineEventHandler(async (event) => {
  // Rate limiting
  const clientIp = getHeader(event, 'x-forwarded-for')
    || getHeader(event, 'x-real-ip')
    || event.node.req.socket.remoteAddress
    || 'unknown'

  const now = Date.now()
  const record = rateLimitMap.get(clientIp)

  if (record && record.resetAt > now) {
    if (record.count >= RATE_LIMIT_MAX) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests. Please try again later.'
      })
    }
    record.count++
  } else {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
  }

  const body = await readBody<ContactRequestBody>(event)

  // 1. Validation
  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email, and message are required fields.'
    })
  }

  // Input length validation to prevent payload abuse
  if (body.name.length > 200 || body.email.length > 254 || body.message.length > 5000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Input exceeds maximum allowed length.'
    })
  }
  if (body.phone && body.phone.length > 30) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone number exceeds maximum allowed length.'
    })
  }
  if (body.subject && body.subject.length > 300) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Subject exceeds maximum allowed length.'
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address format.'
    })
  }

  const type = body.type || 'general'
  const allowedTypes = ['general', 'partnership', 'enrollment', 'media']
  if (!allowedTypes.includes(type)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid inquiry type. Allowed: ${allowedTypes.join(', ')}`
    })
  }

  try {
    // 2. Insert into Supabase using the service role client (server-side only)
    const client = await serverSupabaseServiceRole(event)
    const { data, error } = await client
      .from('inquiries')
      .insert([
        {
          name: body.name,
          email: body.email,
          phone: body.phone || null,
          subject: body.subject || null,
          message: body.message,
          type: type,
          is_read: false
        }
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save inquiry to database.'
      })
    }

    return {
      success: true,
      message: 'Inquiry submitted successfully.',
      data: data?.[0]
    }
  } catch (err: any) {
    console.error('Server contact API error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Internal server error occurred.'
    })
  }
})
