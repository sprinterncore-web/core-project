/**
 * Diagnose admin login: auth user, admins row, RLS as anon after sign-in.
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'sprinterncore@gmail.com'
const PASSWORD = 'QWERTYUI8'

function loadEnv() {
  const raw = readFileSync('.env.local', 'utf8')
  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    process.env[t.slice(0, i)] = t.slice(i + 1)
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const service = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log('--- Service role: auth users matching email ---')
const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 })
const matches = list.users.filter(
  (u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
)
for (const u of matches) {
  console.log({
    id: u.id,
    email: u.email,
    confirmed: !!u.email_confirmed_at,
    created: u.created_at,
  })
}

console.log('\n--- Service role: public.admins ---')
const { data: admins, error: adminsErr } = await service
  .from('admins')
  .select('*')
  .eq('email', ADMIN_EMAIL)
console.log('rows:', admins, 'error:', adminsErr?.message)

console.log('\n--- Anon: signIn + select own admin row (mirrors login page) ---')
const userClient = createClient(url, anon)
const { data: signIn, error: signInErr } =
  await userClient.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: PASSWORD,
  })
if (signInErr) {
  console.log('signIn FAILED:', signInErr.message)
  process.exit(1)
}
console.log('signed in as:', signIn.user?.id, signIn.user?.email)

const { data: adminRow, error: selErr } = await userClient
  .from('admins')
  .select('id, role')
  .eq('id', signIn.user.id)
  .single()

console.log('adminRow:', adminRow)
console.log('select error:', selErr?.message, selErr?.code, selErr?.details)

await userClient.auth.signOut()
