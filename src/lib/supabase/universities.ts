import { createClient } from './client'
import type { University } from '@/types/database'

export async function getUniversities(): Promise<University[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('universities')
    .select('*')
    .order('name', { ascending: true })
  return (data ?? []) as University[]
}
