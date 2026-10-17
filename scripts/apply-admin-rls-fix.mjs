/**
 * Applies admin RLS fix via direct Postgres (DDL).
 * Set SUPABASE_DB_URL in .env.local (Dashboard → Connect → URI, session mode).
 *
 * Usage: npm run apply-admin-rls-fix
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

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

const dbUrl = process.env.SUPABASE_DB_URL
if (!dbUrl) {
  console.error(
    'Add SUPABASE_DB_URL to .env.local (Supabase → Project Settings → Database → Connection string → URI).'
  )
  console.error('Then run: npm run apply-admin-rls-fix')
  console.error(
    'Or paste supabase/schema-v3-admin-rls-fix.sql into the SQL Editor and run it.'
  )
  process.exit(1)
}

const here = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(
  join(here, '..', 'supabase', 'schema-v3-admin-rls-fix.sql'),
  'utf8'
)

const { default: postgres } = await import('postgres')
const sqlClient = postgres(dbUrl, { max: 1 })

try {
  await sqlClient.unsafe(sql)
  console.log('✅ Admin RLS fix applied.')
} catch (e) {
  console.error('Failed:', e.message)
  process.exit(1)
} finally {
  await sqlClient.end()
}
