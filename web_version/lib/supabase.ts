import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zegqjipnagceamxvdygk.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_IcJtQ_1chEbjm-ZT2ffByw_TOVFrwjW"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
