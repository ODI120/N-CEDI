/**
 * Admin Activity Logger Middleware
 * 
 * Purpose: Log all admin portal access and actions for security auditing
 * 
 * Logs include:
 * - Admin login/logout
 * - Data access patterns
 * - Configuration changes
 * - Error attempts
 */

import { serverSupabaseUser } from '#supabase/server'

interface AdminActivityLog {
  user_id: string
  email: string
  action: string
  resource: string
  method: string
  status: number
  ip_address?: string
  timestamp: string
  details?: Record<string, any>
}

export default defineEventHandler(async (event) => {
  // Only log admin endpoints
  if (!event.node.req.url?.startsWith('/api/admin')) {
    return
  }

  const startTime = Date.now()

  // Capture the original end function
  const originalEnd = event.node.res.end

  // Override res.end to capture status code
  event.node.res.end = function (...args: any[]) {
    const duration = Date.now() - startTime
    const statusCode = event.node.res.statusCode || 200

    logAdminActivity({
      url: event.node.req.url,
      method: event.node.req.method,
      statusCode,
      duration,
      event
    })

    return originalEnd.apply(event.node.res, args)
  }
})

async function logAdminActivity(
  params: {
    url: string
    method: string
    statusCode: number
    duration: number
    event: any
  }
) {
  try {
    const user = await serverSupabaseUser(params.event)
    
    if (!user) return // Only log authenticated admin actions

    const ipAddress = getHeader(params.event, 'x-forwarded-for') || 
                     getHeader(params.event, 'x-real-ip') ||
                     'unknown'

    const logEntry: AdminActivityLog = {
      user_id: user.id,
      email: user.email || 'unknown',
      action: params.method,
      resource: params.url,
      method: params.method,
      status: params.statusCode,
      ip_address: ipAddress,
      timestamp: new Date().toISOString(),
      details: {
        duration_ms: params.duration,
        status_code: params.statusCode
      }
    }

    // Log critical operations
    if (
      params.method === 'POST' ||
      params.method === 'PATCH' ||
      params.method === 'DELETE' ||
      params.statusCode >= 400
    ) {
      console.info(`[ADMIN_AUDIT] ${JSON.stringify(logEntry)}`)
    }

    // TODO: In production, store to audit_logs table in Supabase
    // This would require a service role context
  } catch (error) {
    console.error('[ADMIN_AUDIT] Failed to log activity:', error)
  }
}
