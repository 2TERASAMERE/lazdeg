import { getExercise } from './data'
import { formatWeight, parseNumber } from './format'
import type { ExerciseLog, Program, SessionLog, SetLog } from './types'

export function sessionKey(date: string, programId: string): string {
  return `${date}__${programId}`
}

/** Une séance compte dans l'historique dès qu'une série est validée. */
export function hasProgress(session: SessionLog): boolean {
  return Object.values(session.exercises).some((log) => log.sets.some((set) => set.done))
}

/** Dernière séance du même programme avant `beforeDate` (sert au rappel d'historique et au pré-remplissage). */
export function findLastSession(
  sessions: Record<string, SessionLog>,
  programId: string,
  beforeDate: string,
): SessionLog | undefined {
  return Object.values(sessions)
    .filter((s) => s.programId === programId && s.date < beforeDate && hasProgress(s))
    .sort((a, b) => b.date.localeCompare(a.date) || b.startedAt - a.startedAt)[0]
}

/** Poids de la dernière série validée (la plus récente) d'un exercice, ou undefined s'il n'y en a pas. */
function lastDoneWeight(log: ExerciseLog | undefined): string | undefined {
  const done = (log?.sets ?? []).filter((s) => s.done && parseNumber(s.weight) > 0)
  if (done.length === 0) return undefined
  return done.reduce((a, b) => ((b.doneAt ?? 0) >= (a.doneAt ?? 0) ? b : a)).weight
}

/**
 * Crée une séance vierge pour un programme.
 * Le poids de toutes les séries d'un exercice est pré-rempli avec celui de la dernière série validée
 * la dernière fois, sinon avec la charge de départ du programme.
 * Les répétitions viennent toujours de la cible du programme : ainsi, modifier les reps d'un programme
 * est pris en compte dès la séance suivante (la ligne « Dernière séance » rappelle ce qui a été fait).
 */
export function buildDraftSession(program: Program, date: string, last?: SessionLog): SessionLog {
  const exercises: Record<string, ExerciseLog> = {}
  for (const item of program.items) {
    const exercise = getExercise(item.exerciseId)
    if (!exercise || exercise.deleted) continue
    const prev = last?.exercises[item.exerciseId]
    const startWeight =
      lastDoneWeight(prev) ?? (item.startWeight !== undefined ? String(item.startWeight) : '')
    const sets: SetLog[] = Array.from({ length: item.sets }, () => ({
      weight: exercise.kind === 'cardio' ? '' : startWeight,
      reps: String(item.target),
      done: false,
    }))
    exercises[item.exerciseId] = { sets, note: '', restSeconds: prev?.restSeconds ?? item.restSeconds }
  }
  return {
    id: sessionKey(date, program.id),
    date,
    programId: program.id,
    programName: program.name,
    startedAt: Date.now(),
    exercises,
  }
}

/** Complète une séance enregistrée avec les exercices ajoutés au programme depuis. */
export function withNewExercises(stored: SessionLog, draft: SessionLog): SessionLog {
  const missing = Object.keys(draft.exercises).filter((id) => !stored.exercises[id])
  if (missing.length === 0) return stored
  const exercises = { ...stored.exercises }
  for (const id of missing) exercises[id] = draft.exercises[id]
  return { ...stored, exercises }
}

export function updateExercise(
  session: SessionLog,
  exerciseId: string,
  fn: (log: ExerciseLog) => ExerciseLog,
): SessionLog {
  const log = session.exercises[exerciseId]
  if (!log) return session
  return { ...session, exercises: { ...session.exercises, [exerciseId]: fn(log) } }
}

export function updateSet(
  session: SessionLog,
  exerciseId: string,
  index: number,
  fn: (set: SetLog) => SetLog,
): SessionLog {
  return updateExercise(session, exerciseId, (log) => {
    if (!log.sets[index]) return log
    return { ...log, sets: log.sets.map((set, i) => (i === index ? fn(set) : set)) }
  })
}

export function countSets(session: SessionLog): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const log of Object.values(session.exercises)) {
    total += log.sets.length
    done += log.sets.filter((s) => s.done).length
  }
  return { done, total }
}

export function isExerciseComplete(log: ExerciseLog | undefined): boolean {
  return !!log && log.sets.length > 0 && log.sets.every((s) => s.done)
}

/**
 * Durée de la séance : temps entre la validation de la première et de la dernière série, plus 1 minute.
 * Renvoie null si aucune série validée n'a d'horodatage.
 */
export function sessionDurationMinutes(session: SessionLog): number | null {
  const times: number[] = []
  for (const log of Object.values(session.exercises)) {
    for (const set of log.sets) {
      if (set.done && set.doneAt !== undefined) times.push(set.doneAt)
    }
  }
  if (times.length === 0) return null
  return Math.round((Math.max(...times) - Math.min(...times)) / 60000) + 1
}

/** Volume = somme poids × reps des séries validées (musculation uniquement). */
export function sessionVolume(session: SessionLog): number {
  let volume = 0
  for (const [exerciseId, log] of Object.entries(session.exercises)) {
    if (getExercise(exerciseId)?.kind !== 'strength') continue
    for (const set of log.sets) {
      if (set.done) volume += parseNumber(set.weight) * parseNumber(set.reps)
    }
  }
  return Math.round(volume)
}

/** « 80 kg × 10 » : la série la plus lourde validée la dernière fois, ou null s'il n'y a rien. */
export function describeBestSet(log: ExerciseLog | undefined, kind: 'strength' | 'cardio'): string | null {
  const done = log?.sets.filter((s) => s.done) ?? []
  if (done.length === 0) return null
  if (kind === 'cardio') return `${done[0].reps} min`
  const top = done.reduce((best, set) => (parseNumber(set.weight) > parseNumber(best.weight) ? set : best))
  return parseNumber(top.weight) > 0 ? `${formatWeight(top.weight)} kg × ${top.reps}` : `${top.reps} reps`
}
