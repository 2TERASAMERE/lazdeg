'use client'

import { useMemo, useState } from 'react'
import { useAppState } from '@/hooks/use-app-state'
import { useRestTimer } from '@/hooks/use-rest-timer'
import { useSync } from '@/hooks/use-sync'
import { DEFAULT_PROGRAMS, setCatalog } from '@/lib/data'
import { getWeek, toISODate, weekdayIndex } from '@/lib/dates'
import type { Exercise, Program, TabId } from '@/lib/types'
import { BottomNav } from './bottom-nav'
import { GlossaryView } from './glossary/glossary-view'
import { ProgramView } from './program/program-view'
import { ProgressView } from './progress/progress-view'
import { RestTimerToast } from './rest-timer-toast'
import { SyncPanel } from './sync-panel'
import { Topbar } from './topbar'
import { WorkoutView } from './workout/workout-view'

export function AppShell() {
  const { state, ready, update, replace } = useAppState()
  const rest = useRestTimer()
  const sync = useSync({ state, ready, update })
  const [tab, setTab] = useState<TabId>('workout')
  const [today] = useState(() => new Date())
  const [pickedDay, setPickedDay] = useState<number | null>(null)

  // Le catalogue d'exercices vit dans l'état (modifiable, synchronisé) ; la logique pure le lit via getExercise().
  setCatalog(state.exercises)

  const week = useMemo(() => getWeek(today), [today])
  const todayIso = toISODate(today)
  const selectedDay = pickedDay ?? weekdayIndex(today)
  const exercises = useMemo(() => state.exercises.filter((e) => !e.deleted), [state.exercises])
  const programs = useMemo(
    () => [...DEFAULT_PROGRAMS, ...state.customPrograms.filter((p) => !p.deleted)],
    [state.customPrograms],
  )

  // Avant le chargement des données locales, on n'affiche que l'en-tête (évite tout écart serveur / client).
  if (!ready) {
    return (
      <main className="app-shell">
        <Topbar />
      </main>
    )
  }

  // Chaque modification est horodatée (updatedAt) : c'est ce qui permet de fusionner les appareils.
  const assign = (dayIndex: number, programId: string) =>
    update((s) => ({
      ...s,
      assignments: s.assignments.map((id, i) =>
        i === dayIndex ? (id === programId ? null : programId) : id,
      ),
      assignmentsUpdatedAt: Date.now(),
    }))

  const createProgram = (program: Program) =>
    update((s) => ({ ...s, customPrograms: [...s.customPrograms, { ...program, updatedAt: Date.now() }] }))

  const updateProgram = (program: Program) =>
    update((s) => ({
      ...s,
      customPrograms: s.customPrograms.map((p) =>
        p.id === program.id ? { ...program, updatedAt: Date.now() } : p,
      ),
    }))

  const deleteProgram = (programId: string) =>
    update((s) => ({
      ...s,
      customPrograms: s.customPrograms.map((p) =>
        p.id === programId ? { ...p, deleted: true, updatedAt: Date.now() } : p,
      ),
      assignments: s.assignments.map((id) => (id === programId ? null : id)),
      assignmentsUpdatedAt: Date.now(),
    }))

  const saveExercise = (exercise: Exercise) =>
    update((s) => {
      const stamped = { ...exercise, deleted: undefined, updatedAt: Date.now() }
      const exists = s.exercises.some((e) => e.id === exercise.id)
      return {
        ...s,
        exercises: exists
          ? s.exercises.map((e) => (e.id === exercise.id ? stamped : e))
          : [...s.exercises, stamped],
      }
    })

  // Suppression « douce » : l'exercice reste connu pour l'historique et la suppression se propage aux autres appareils.
  const deleteExercise = (exerciseId: string) =>
    update((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.id === exerciseId ? { ...e, deleted: true, updatedAt: Date.now() } : e,
      ),
    }))

  return (
    <main className="app-shell">
      <Topbar />

      {tab === 'workout' && (
        <WorkoutView
          week={week}
          todayIso={todayIso}
          selectedDay={selectedDay}
          onSelectDay={setPickedDay}
          programs={programs}
          state={state}
          update={update}
          onStartRest={rest.start}
          onOpenProgram={() => setTab('program')}
        />
      )}
      {tab === 'program' && (
        <ProgramView
          exercises={exercises}
          week={week}
          programs={programs}
          assignments={state.assignments}
          onAssign={assign}
          onCreate={createProgram}
          onUpdate={updateProgram}
          onDelete={deleteProgram}
        />
      )}
      {tab === 'glossary' && (
        <GlossaryView
          exercises={exercises}
          programs={programs}
          onSave={saveExercise}
          onDelete={deleteExercise}
        />
      )}
      {tab === 'progress' && (
        <ProgressView state={state} todayIso={todayIso} onImport={replace}>
          <SyncPanel sync={sync} />
        </ProgressView>
      )}

      <BottomNav active={tab} onChange={setTab} />

      {rest.status !== 'idle' && (
        <RestTimerToast
          status={rest.status}
          remaining={rest.remaining}
          total={rest.total}
          onAdjust={rest.adjust}
          onStop={rest.stop}
        />
      )}
    </main>
  )
}
