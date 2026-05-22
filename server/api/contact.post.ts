import { serverSupabaseServiceRole } from '#supabase/server'

interface ContactRequestBody {
  name: string
  email: string
  message: string
  phone?: string
  subject?: string
  type?: 'general' | 'partnership' | 'enrollment' | 'media'
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactRequestBody>(event)

  // 1. Validation
  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email, and message are required fields.'
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
