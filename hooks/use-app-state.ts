'use client'

import { useCallback, useEffect, useState } from 'react'
import { createDefaultState, loadState, saveState } from '@/lib/storage'
import type { AppState } from '@/lib/types'

/**
 * État global de l'app, chargé depuis le stockage au montage et sauvegardé à chaque changement.
 * `ready` reste false côté serveur et au premier rendu client, pour éviter tout écart d'hydratation.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(createDefaultState)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(loadState())
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready) saveState(state)
  }, [state, ready])

  const update = useCallback((fn: (prev: AppState) => AppState) => setState(fn), [])
  const replace = useCallback((next: AppState) => setState(next), [])

  return { state, ready, update, replace }
}
