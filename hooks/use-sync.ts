'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { canonicalState, mergeStates } from '@/lib/merge'
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL, isSyncConfigured } from '@/lib/supabase-config'
import { friendlyError, runSync, type SyncClient, type SyncUser } from '@/lib/sync'
import type { AppState } from '@/lib/types'

export type SyncStatus = 'unconfigured' | 'loading' | 'signed-out' | 'idle' | 'syncing' | 'error'

interface Options {
  state: AppState
  ready: boolean
  update: (fn: (prev: AppState) => AppState) => void
}

const DEBOUNCE_MS = 2000
const POLL_MS = 60_000
const MIN_GAP_MS = 10_000

/**
 * Synchronise l'état local avec le cloud (Supabase). Facultatif : sans configuration ni connexion,
 * l'app fonctionne exactement comme avant, avec le seul stockage local.
 *
 * Déclencheurs : connexion, retour sur l'app, retour du réseau, toutes les minutes, et 2 s après
 * la dernière modification locale.
 */
export function useSync({ state, ready, update }: Options) {
  const [status, setStatus] = useState<SyncStatus>(isSyncConfigured ? 'loading' : 'unconfigured')
  const [email, setEmail] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clientRef = useRef<SyncClient | null>(null)
  const userRef = useRef<SyncUser | null>(null)
  const stateRef = useRef(state)
  const lastSyncedRef = useRef('')
  const busyRef = useRef(false)
  const pendingRef = useRef(false)
  const lastRunRef = useRef(0)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const syncNow = useCallback(async () => {
    const client = clientRef.current
    const user = userRef.current
    if (!client || !user) return
    if (busyRef.current) {
      pendingRef.current = true
      return
    }
    busyRef.current = true
    lastRunRef.current = Date.now()
    setStatus('syncing')
    setError(null)
    try {
      const merged = await runSync(client, user.id, stateRef.current)
      lastSyncedRef.current = canonicalState(merged)
      // On refusionne avec l'état le plus récent : les modifications faites pendant la synchro sont conservées.
      update((prev) => {
        const next = mergeStates(prev, merged)
        return canonicalState(next) === canonicalState(prev) ? prev : next
      })
      setLastSyncedAt(Date.now())
      setStatus('idle')
    } catch (e) {
      setError(friendlyError(e instanceof Error ? e.message : undefined))
      setStatus('error')
    } finally {
      busyRef.current = false
      if (pendingRef.current) {
        pendingRef.current = false
        void syncNow()
      }
    }
  }, [update])

  // Démarrage : on charge le client Supabase (à la demande) et on regarde si une session existe déjà.
  useEffect(() => {
    if (!ready || !isSyncConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        const { createSupabaseSyncClient } = await import('@/lib/supabase-client')
        const client = createSupabaseSyncClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY)
        clientRef.current = client
        const user = await client.getUser()
        if (cancelled) return
        if (user) {
          userRef.current = user
          setEmail(user.email)
          setSignedIn(true)
          await syncNow()
        } else {
          setStatus('signed-out')
        }
      } catch (e) {
        if (cancelled) return
        setError(friendlyError(e instanceof Error ? e.message : undefined))
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, syncNow])

  // Modification locale : synchro 2 secondes après la dernière saisie.
  useEffect(() => {
    if (!ready || !signedIn) return
    const id = window.setTimeout(() => {
      if (canonicalState(stateRef.current) !== lastSyncedRef.current) void syncNow()
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [state, ready, signedIn, syncNow])

  // Retour sur l'app, retour du réseau, et vérification régulière quand l'app est visible.
  useEffect(() => {
    if (!signedIn) return
    const trigger = () => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastRunRef.current < MIN_GAP_MS) return
      void syncNow()
    }
    document.addEventListener('visibilitychange', trigger)
    window.addEventListener('online', trigger)
    const id = window.setInterval(trigger, POLL_MS)
    return () => {
      document.removeEventListener('visibilitychange', trigger)
      window.removeEventListener('online', trigger)
      window.clearInterval(id)
    }
  }, [signedIn, syncNow])

  const signIn = useCallback(
    async (mail: string, password: string) => {
      const client = clientRef.current
      if (!client) return
      setError(null)
      setStatus('syncing')
      const result = await client.signIn(mail.trim(), password)
      if ('error' in result) {
        setError(result.error)
        setStatus('signed-out')
        return
      }
      userRef.current = result.user
      setEmail(result.user.email)
      setSignedIn(true)
      await syncNow()
    },
    [syncNow],
  )

  const signOut = useCallback(async () => {
    await clientRef.current?.signOut()
    userRef.current = null
    lastSyncedRef.current = ''
    setSignedIn(false)
    setEmail(null)
    setLastSyncedAt(null)
    setError(null)
    setStatus('signed-out')
  }, [])

  return { status, email, lastSyncedAt, error, signIn, signOut, syncNow }
}

export type SyncController = ReturnType<typeof useSync>
