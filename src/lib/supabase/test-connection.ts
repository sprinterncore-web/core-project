import { createClient } from './client'

export async function testSupabaseConnection() {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      return false
    }
    console.log('✅ Supabase connected successfully')
    console.log(
      'Session:',
      data.session ? 'Active' : 'No active session (expected)'
    )
    return true
  } catch (err) {
    console.error('❌ Supabase connection error:', err)
    return false
  }
}
