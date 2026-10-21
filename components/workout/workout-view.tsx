'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronRight, Clock3, Dumbbell, Flame, Share2 } from 'lucide-react'
import { useWorkout } from '@/hooks/use-workout'
import { USER_NAME } from '@/lib/config'
import { getExercise } from '@/lib/data'
import type { WeekDay } from '@/lib/dates'
import { formatLongDate } from '@/lib/dates'
import { pluralize } from '@/lib/format'
import { buildSummary } from '@/lib/summary'
import type { AppState, Exercise, Program } from '@/lib/types'
import { countSets, describeBestSet, hasProgress, isExerciseComplete } from '@/lib/workout'
import { DayStrip } from './day-strip'
import { ExerciseCard } from './exercise-card'
import { ShareModal } from './share-modal'

interface Props {
  week: WeekDay[]
  todayIso: string
  selectedDay: number
  onSelectDay: (index: number) => void
  programs: Program[]
  state: AppState
  update: (fn: (prev: AppState) => AppState) => void
  onStartRest: (seconds: number) => void
  onOpenProgram: () => void
}

export function WorkoutView({
  week,
  todayIso,
  selectedDay,
  onSelectDay,
  programs,
  state,
  update,
  onStartRest,
  onOpenProgram,
}: Props) {
  const day = week[selectedDay]
  const program = programs.find((p) => p.id === state.assignments[selectedDay]) ?? null
  const workout = useWorkout({ state, update, program, date: day.iso })
  const { session, lastSession } = workout

  const [showShare, setShowShare] = useState(false)
  // Exercice ouvert choisi à la main. Valable uniquement pour la séance en cours d'affichage.
  const [manualOpen, setManualOpen] = useState<{ sessionId: string; id: string | null } | null>(null)

  const entries = useMemo(() => {
    if (!program || !session) return []
    return program.items
      .map((item) => ({ item, exercise: getExercise(item.exerciseId) }))
      .filter(
        (e): e is { item: typeof e.item; exercise: Exercise } =>
          !!e.exercise && !!session.exercises[e.item.exerciseId],
      )
  }, [program, session])

  const weekCount = useMemo(() => {
    const dates = new Set(week.map((d) => d.iso))
    return Object.values(state.sessions).filter((s) => dates.has(s.date) && hasProgress(s)).length
  }, [week, state.sessions])

  const counts = session ? countSets(session) : { done: 0, total: 0 }

  const firstIncompleteId = session
    ? (entries.find((e) => !isExerciseComplete(session.exercises[e.exercise.id]))?.exercise.id ?? null)
    : null
  const openId = session && manualOpen?.sessionId === session.id ? manualOpen.id : firstIncompleteId

  const handleToggleSet = (exerciseId: string, setIndex: number) => {
    if (!session) return
    const log = session.exercises[exerciseId]
    const wasDone = log.sets[setIndex].done
    workout.toggleSet(exerciseId, setIndex)
    if (wasDone) return

    // Le chrono démarre à la validation, sauf si c'est la toute dernière série de la séance.
    if (counts.done + 1 < counts.total && log.restSeconds > 0) onStartRest(log.restSeconds)

    // Exercice terminé : on ouvre automatiquement le suivant.
    if (log.sets.filter((s) => s.done).length + 1 === log.sets.length) {
      const order = entries.map((e) => e.exercise.id)
      const at = order.indexOf(exerciseId)
      const next = [...order.slice(at + 1), ...order.slice(0, at)].find(
        (id) => !isExerciseComplete(session.exercises[id]),
      )
      setManualOpen({ sessionId: session.id, id: next ?? null })
    }
  }

  const handleFinish = () => {
    workout.finish()
    setShowShare(true)
  }

  const summary = showShare && session && program ? buildSummary(session, program) : ''

  return (
    <div className="page-content workout-content">
      <div className="section-kicker">{formatLongDate(day.iso).toUpperCase()}</div>
      <div className="hero-row">
        <div>
          <h1>Let's go, {USER_NAME}.</h1>
          <p className="muted-copy">
            {program ? 'Ta séance est prête.' : 'Pas de séance prévue ce jour-là.'}
          </p>
        </div>
        <div className="streak" title="Séances faites cette semaine">
          <Flame size={16} fill="currentColor" />
          <strong>{String(weekCount).padStart(2, '0')}</strong>
          <span>
            {pluralize(weekCount, 'séance')}
            <br />
            cette semaine
          </span>
        </div>
      </div>

      <DayStrip
        week={week}
        todayIso={todayIso}
        selected={selectedDay}
        assignments={state.assignments}
        programs={programs}
        onSelect={onSelectDay}
      />

      <div className="session-summary">
        <div className="summary-icon">
          <Dumbbell size={19} />
        </div>
        <div>
          <span>SÉANCE DU JOUR</span>
          <strong>{program?.name ?? 'Repos'}</strong>
        </div>
        <div className="summary-meta">
          <Clock3 size={14} /> {program ? `${program.durationMin} min` : '—'}
        </div>
      </div>

      {program && session ? (
        <>
          <div className="section-heading">
            <div>
              <h2>Ton entraînement</h2>
              <p>
                {entries.length} {pluralize(entries.length, 'exercice')} · {counts.done}/{counts.total} séries
              </p>
            </div>
            <button type="button" className="session-picker-button" onClick={onOpenProgram}>
              Changer <ChevronRight size={14} />
            </button>
          </div>

          <div className="exercise-list">
            {entries.map(({ exercise }, i) => (
              <ExerciseCard
                key={`${session.id}:${exercise.id}`}
                index={i}
                exercise={exercise}
                log={session.exercises[exercise.id]}
                previous={describeBestSet(lastSession?.exercises[exercise.id], exercise.kind)}
                expanded={openId === exercise.id}
                onToggleExpanded={() =>
                  setManualOpen({ sessionId: session.id, id: openId === exercise.id ? null : exercise.id })
                }
                onField={(setIndex, field, value) => workout.setField(exercise.id, setIndex, field, value)}
                onToggleSet={(setIndex) => handleToggleSet(exercise.id, setIndex)}
                onNote={(note) => workout.setNote(exercise.id, note)}
                onRestSeconds={(seconds) => workout.setRestSeconds(exercise.id, seconds)}
              />
            ))}
          </div>

          <button type="button" className="finish-button" onClick={handleFinish} disabled={counts.done === 0}>
            <Share2 size={17} />{' '}
            {session.finishedAt ? 'Revoir le résumé & partager' : 'Terminer & partager la séance'}
          </button>
          <p className="save-note">
            <Check size={13} /> Enregistré automatiquement sur cet appareil
          </p>
        </>
      ) : (
        <div className="rest-day-state">
          <Clock3 size={24} />
          <strong>Journée de repos</strong>
          <span>Aucune séance n’est prévue. Choisis un programme si tu veux t’entraîner ce jour-là.</span>
          <button type="button" className="finish-button" onClick={onOpenProgram}>
            Choisir une séance
          </button>
        </div>
      )}

      {showShare && session && program && (
        <ShareModal
          program={program}
          session={session}
          summary={summary}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
