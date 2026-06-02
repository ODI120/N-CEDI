import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

function readEnv() {
  const env: Record<string, string> = {}
  try {
    const fileContent = readFileSync(join(process.cwd(), '.env'), 'utf-8')
    fileContent.split(/\r?\n/).forEach(line => {
      const parts = line.split('=')
      if (parts.length >= 2) {
        const key = parts[0].trim()
        const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '')
        env[key] = val
      }
    })
  } catch (e) {
    console.error('Failed to read .env file:', e)
  }
  return env
}

const env = readEnv()
const supabaseUrl = env['SUPABASE_URL']
const supabaseServiceRole = env['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRole)

async function run() {
  console.log('--- FETCHING AUTH USERS ---')
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
  if (authError) {
    console.error('Error listing auth users:', authError)
  } else {
    console.log(`Found ${authData.users.length} auth users:`)
    authData.users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Created At: ${u.created_at}`)
    })
  }

  console.log('\n--- FETCHING PUBLIC.ADMIN_USERS ---')
  const { data: adminData, error: adminError } = await supabase
    .from('admin_users')
    .select('*')
  
  if (adminError) {
    console.error('Error listing admin_users:', adminError)
  } else {
    console.log(`Found ${adminData.length} records in admin_users:`)
    adminData.forEach(a => {
      console.log(`- User ID: ${a.user_id} | Role: ${a.role} | Active: ${a.is_active}`)
    })
  }
}

run()
