import { canonicalState, mergeStates } from './merge'
import { normalizeState } from './storage'
import type { AppState } from './types'

export interface SyncUser {
  id: string
  email: string
}

export interface RemoteRow {
  data: unknown
  /** Numéro de version de la ligne, pour détecter une modification simultanée. */
  version: number
}

/** Ce dont la synchronisation a besoin du cloud. Implémenté avec Supabase dans lib/supabase-client.ts. */
export interface SyncClient {
  getUser(): Promise<SyncUser | null>
  signIn(email: string, password: string): Promise<{ user: SyncUser } | { error: string }>
  signOut(): Promise<void>
  fetchRemote(userId: string): Promise<RemoteRow | null>
  /** false = la ligne existe déjà (un autre appareil vient de la créer). */
  insertRemote(userId: string, data: AppState): Promise<boolean>
  /** false = la version a changé entre-temps. */
  updateRemote(userId: string, data: AppState, expectedVersion: number): Promise<boolean>
}

/**
 * Télécharge l'état du cloud, le fusionne avec `local`, renvoie le résultat et l'envoie si nécessaire.
 * Si un autre appareil écrit en même temps, on recommence avec les données à jour (jusqu'à `maxTries`).
 */
export async function runSync(
  client: SyncClient,
  userId: string,
  local: AppState,
  maxTries = 4,
): Promise<AppState> {
  let current = local
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const row = await client.fetchRemote(userId)

    if (!row) {
      if (await client.insertRemote(userId, current)) return current
      continue
    }

    const remote = normalizeState(row.data)
    if (!remote) throw new Error('Les données du cloud sont illisibles. Rien n’a été modifié.')

    const merged = mergeStates(current, remote)
    if (canonicalState(merged) === canonicalState(remote)) return merged
    if (await client.updateRemote(userId, merged, row.version)) return merged
    current = merged
  }
  throw new Error('Synchronisation impossible pour le moment. Réessaie dans un instant.')
}

/** Message lisible à partir d'une erreur technique. */
export function friendlyError(message: string | undefined): string {
  const text = (message ?? '').toLowerCase()
  if (text.includes('invalid login')) return 'E-mail ou mot de passe incorrect.'
  if (text.includes('failed to fetch') || text.includes('network') || text.includes('load failed'))
    return 'Pas de connexion internet.'
  if (text.includes('email not confirmed'))
    return 'Compte non confirmé : valide-le dans Supabase (voir le README).'
  return message || 'Une erreur est survenue.'
}
