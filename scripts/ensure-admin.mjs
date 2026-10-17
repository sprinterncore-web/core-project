/**
 * Ensures sprinterncore@gmail.com exists in public.admins (matches auth.users id).
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Usage: npm run ensure-admin
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'sprinterncore@gmail.com'

function loadEnv() {
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const i = t.indexOf('=')
      if (i === -1) continue
      process.env[t.slice(0, i)] = t.slice(i + 1)
    }
  } catch {
    /* ignore */
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: list, error: listError } = await admin.auth.admin.listUsers({
  perPage: 1000,
})

if (listError) {
  console.error('listUsers failed:', listError.message)
  process.exit(1)
}

const user = list.users.find(
  (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
)

if (!user) {
  console.error(`No auth user for ${ADMIN_EMAIL}. Sign up first.`)
  process.exit(1)
}

const { data: row, error: upsertError } = await admin
  .from('admins')
  .upsert(
    {
      id: user.id,
      email: ADMIN_EMAIL,
      full_name: 'Sprintern Admin',
      role: 'super_admin',
    },
    { onConflict: 'id' }
  )
  .select()
  .single()

if (upsertError) {
  console.error('admins upsert failed:', upsertError.message)
  console.error(
    'If the table is missing, run supabase/schema-v3.sql in the SQL Editor.'
  )
  process.exit(1)
}

console.log(`✅ Admin access granted for ${ADMIN_EMAIL} (id: ${user.id})`)
if (row) console.log('   Row:', row)
