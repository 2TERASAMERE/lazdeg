'use client'

import { useCallback, useMemo } from 'react'
import type { AppState, Program, SessionLog } from '@/lib/types'
import {
  buildDraftSession,
  findLastSession,
  sessionKey,
  updateExercise,
  updateSet,
  withNewExercises,
} from '@/lib/workout'

interface Options {
  state: AppState
  update: (fn: (prev: AppState) => AppState) => void
  /** Programme prévu ce jour-là (null = repos). */
  program: Program | null
  /** Date de la séance, AAAA-MM-JJ. */
  date: string
}

/**
 * Séance du jour sélectionné.
 * Tant que rien n'est modifié, la séance n'existe qu'en mémoire (brouillon pré-rempli) :
 * elle n'est enregistrée — et ne compte dans l'historique — qu'à la première modification.
 * Si le programme a gagné des exercices depuis, ils sont ajoutés à la séance déjà enregistrée.
 */
export function useWorkout({ state, update, program, date }: Options) {
  const key = program ? sessionKey(date, program.id) : null
  const stored = key ? state.sessions[key] : undefined

  const lastSession = useMemo(
    () => (program ? findLastSession(state.sessions, program.id, date) : undefined),
    [state.sessions, program, date],
  )

  const session: SessionLog | null = useMemo(() => {
    if (!program) return null
    const draft = buildDraftSession(program, date, lastSession)
    return stored ? withNewExercises(stored, draft) : draft
  }, [stored, program, date, lastSession])

  const patch = useCallback(
    (fn: (s: SessionLog) => SessionLog) => {
      if (!program || !key) return
      update((prev) => {
        const draft = buildDraftSession(program, date, findLastSession(prev.sessions, program.id, date))
        const saved = prev.sessions[key]
        const current = saved ? withNewExercises(saved, draft) : draft
        return { ...prev, sessions: { ...prev.sessions, [key]: { ...fn(current), updatedAt: Date.now() } } }
      })
    },
    [program, key, date, update],
  )

  const setField = useCallback(
    (exerciseId: string, index: number, field: 'weight' | 'reps', raw: string) => {
      // Poids : chiffres, virgule ou point. Reps : chiffres uniquement.
      const value = field === 'weight' ? raw.replace(/[^\d.,]/g, '') : raw.replace(/\D/g, '')
      patch((s) => updateSet(s, exerciseId, index, (set) => ({ ...set, [field]: value })))
    },
    [patch],
  )

  const toggleSet = useCallback(
    (exerciseId: string, index: number) => {
      patch((s) =>
        updateSet(s, exerciseId, index, (set) =>
          set.done ? { ...set, done: false, doneAt: undefined } : { ...set, done: true, doneAt: Date.now() },
        ),
      )
    },
    [patch],
  )

  const setNote = useCallback(
    (exerciseId: string, note: string) =>
      patch((s) => updateExercise(s, exerciseId, (log) => ({ ...log, note }))),
    [patch],
  )

  const setRestSeconds = useCallback(
    (exerciseId: string, restSeconds: number) =>
      patch((s) => updateExercise(s, exerciseId, (log) => ({ ...log, restSeconds }))),
    [patch],
  )

  const finish = useCallback(() => patch((s) => ({ ...s, finishedAt: Date.now() })), [patch])

  return { session, lastSession, setField, toggleSet, setNote, setRestSeconds, finish }
}
