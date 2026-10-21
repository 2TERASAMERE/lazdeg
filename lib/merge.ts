import type { AppState, SessionLog } from './types'

/** JSON à clés triées : deux états identiques donnent exactement le même texte. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    const parts = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stable(record[key])}`)
    return `{${parts.join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

const byId = <T extends { id: string }>(a: T, b: T) => a.id.localeCompare(b.id)

/** Représentation canonique d'un état, pour savoir si deux états sont identiques. */
export function canonicalState(state: AppState): string {
  return stable({
    ...state,
    exercises: [...state.exercises].sort(byId),
    customPrograms: [...state.customPrograms].sort(byId),
  })
}

const sessionStamp = (s: SessionLog) => s.updatedAt ?? s.finishedAt ?? s.startedAt ?? 0

/** Garde la version la plus récente ; à égalité, choix déterministe (même résultat sur tous les appareils). */
function newest<T>(a: T, b: T, stamp: (item: T) => number): T {
  const diff = stamp(a) - stamp(b)
  if (diff !== 0) return diff > 0 ? a : b
  return stable(a) >= stable(b) ? a : b
}

function mergeById<T extends { id: string; updatedAt?: number }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>()
  for (const item of [...a, ...b]) {
    const current = map.get(item.id)
    map.set(item.id, current ? newest(current, item, (x) => x.updatedAt ?? 0) : item)
  }
  return [...map.values()]
}

/**
 * Fusionne deux états (ex. cet appareil + le cloud), élément par élément.
 * Pour chaque exercice, programme ou séance, la version modifiée en dernier l'emporte :
 * ajouter un exercice sur un appareil et faire une séance sur l'autre ne s'écrasent donc pas.
 * L'opération est commutative et idempotente.
 */
export function mergeStates(a: AppState, b: AppState): AppState {
  const sessions: Record<string, SessionLog> = {}
  for (const key of new Set([...Object.keys(a.sessions), ...Object.keys(b.sessions)])) {
    const x = a.sessions[key]
    const y = b.sessions[key]
    sessions[key] = x && y ? newest(x, y, sessionStamp) : (x ?? y)
  }

  const planning = newest(
    { assignments: a.assignments, updatedAt: a.assignmentsUpdatedAt },
    { assignments: b.assignments, updatedAt: b.assignmentsUpdatedAt },
    (p) => p.updatedAt,
  )

  return {
    version: 1,
    exercises: mergeById(a.exercises, b.exercises),
    customPrograms: mergeById(a.customPrograms, b.customPrograms),
    assignments: planning.assignments,
    assignmentsUpdatedAt: planning.updatedAt,
    sessions,
  }
}
