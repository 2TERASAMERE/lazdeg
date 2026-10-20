'use client'

import { useMemo, useState } from 'react'
import { useAppState } from '@/hooks/use-app-state'
import { useRestTimer } from '@/hooks/use-rest-timer'
import { DEFAULT_PROGRAMS } from '@/lib/data'
import { getWeek, toISODate, weekdayIndex } from '@/lib/dates'
import type { Program, TabId } from '@/lib/types'
import { BottomNav } from './bottom-nav'
import { GlossaryView } from './glossary/glossary-view'
import { ProgramView } from './program/program-view'
import { ProgressView } from './progress/progress-view'
import { RestTimerToast } from './rest-timer-toast'
import { Topbar } from './topbar'
import { WorkoutView } from './workout/workout-view'

export function AppShell() {
  const { state, ready, update, replace } = useAppState()
  const rest = useRestTimer()
  const [tab, setTab] = useState<TabId>('workout')
  const [today] = useState(() => new Date())
  const [pickedDay, setPickedDay] = useState<number | null>(null)

  const week = useMemo(() => getWeek(today), [today])
  const todayIso = toISODate(today)
  const selectedDay = pickedDay ?? weekdayIndex(today)
  const programs = useMemo(() => [...DEFAULT_PROGRAMS, ...state.customPrograms], [state.customPrograms])

  // Avant le chargement des données locales, on n'affiche que l'en-tête (évite tout écart serveur / client).
  if (!ready) {
    return (
      <main className="app-shell">
        <Topbar />
      </main>
    )
  }

  const assign = (dayIndex: number, programId: string) =>
    update((s) => ({
      ...s,
      assignments: s.assignments.map((id, i) =>
        i === dayIndex ? (id === programId ? null : programId) : id,
      ),
    }))

  const createProgram = (program: Program) =>
    update((s) => ({ ...s, customPrograms: [...s.customPrograms, program] }))

  const deleteProgram = (programId: string) =>
    update((s) => ({
      ...s,
      customPrograms: s.customPrograms.filter((p) => p.id !== programId),
      assignments: s.assignments.map((id) => (id === programId ? null : id)),
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
          week={week}
          programs={programs}
          assignments={state.assignments}
          onAssign={assign}
          onCreate={createProgram}
          onDelete={deleteProgram}
        />
      )}
      {tab === 'glossary' && <GlossaryView />}
      {tab === 'progress' && <ProgressView state={state} todayIso={todayIso} onImport={replace} />}

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
