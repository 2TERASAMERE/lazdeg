import { createClient } from '@supabase/supabase-js'
import { friendlyError, type SyncClient } from './sync'

/** Implémentation Supabase de SyncClient. Chargée uniquement si la synchronisation est configurée. */
export function createSupabaseSyncClient(url: string, publicKey: string): SyncClient {
  const supabase = createClient(url, publicKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })

  return {
    async getUser() {
      const { data } = await supabase.auth.getSession()
      const user = data.session?.user
      return user ? { id: user.id, email: user.email ?? '' } : null
    },

    async signIn(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error || !data.user) return { error: friendlyError(error?.message) }
      return { user: { id: data.user.id, email: data.user.email ?? email } }
    },

    async signOut() {
      await supabase.auth.signOut()
    },

    async fetchRemote(userId) {
      const { data, error } = await supabase
        .from('app_state')
        .select('data, version')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw new Error(friendlyError(error.message))
      return data ? { data: data.data, version: data.version as number } : null
    },

    async insertRemote(userId, data) {
      const { error } = await supabase.from('app_state').insert({ user_id: userId, data, version: 1 })
      if (!error) return true
      if (error.code === '23505') return false
      throw new Error(friendlyError(error.message))
    },

    async updateRemote(userId, data, expectedVersion) {
      const { data: rows, error } = await supabase
        .from('app_state')
        .update({ data, version: expectedVersion + 1, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('version', expectedVersion)
        .select('version')
      if (error) throw new Error(friendlyError(error.message))
      return (rows?.length ?? 0) > 0
    },
  }
}
