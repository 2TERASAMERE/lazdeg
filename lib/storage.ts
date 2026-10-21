import { STORAGE_KEY } from './config'
import { DEFAULT_ASSIGNMENTS, DEFAULT_EXERCISES } from './data'
import type { AppState, Exercise, Program } from './types'

/**
 * Sauvegarde locale (localStorage). C'est la copie de travail de l'app : elle fonctionne hors connexion.
 * La synchronisation avec le cloud (lib/sync.ts) fusionne ensuite cet état avec celui des autres appareils.
 */

export function createDefaultState(): AppState {
  return {
    version: 1,
    exercises: DEFAULT_EXERCISES.map((e) => ({ ...e })),
    customPrograms: [],
    assignments: [...DEFAULT_ASSIGNMENTS],
    assignmentsUpdatedAt: 0,
    sessions: {},
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object'

function isExercise(v: unknown): v is Exercise {
  return isObject(v) && typeof v.id === 'string' && typeof v.name === 'string' && Array.isArray(v.settings)
}

function isProgram(v: unknown): v is Program {
  return isObject(v) && typeof v.id === 'string' && typeof v.name === 'string' && Array.isArray(v.items)
}

/** Valide un objet inconnu (sauvegarde locale, cloud ou fichier importé) et complète les champs manquants. */
export function normalizeState(input: unknown): AppState | null {
  if (!isObject(input) || input.version !== 1) return null
  const base = createDefaultState()

  const exercises = (Array.isArray(input.exercises) ? input.exercises.filter(isExercise) : []).map((e) => ({
    ...e,
    updatedAt: e.updatedAt ?? 0,
  }))
  // Exercices d'origine ajoutés plus tard dans le code : on les complète s'ils sont inconnus.
  const known = new Set(exercises.map((e) => e.id))
  for (const d of DEFAULT_EXERCISES) if (!known.has(d.id)) exercises.push({ ...d })

  const customPrograms = (
    Array.isArray(input.customPrograms) ? input.customPrograms.filter(isProgram) : []
  ).map((p) => ({ ...p, updatedAt: p.updatedAt ?? 0 }))

  const assignments =
    Array.isArray(input.assignments) && input.assignments.length === 7
      ? (input.assignments as (string | null)[])
      : base.assignments
  // Ancienne sauvegarde sans date : si le planning a été changé, on le considère comme récent.
  const assignmentsUpdatedAt =
    typeof input.assignmentsUpdatedAt === 'number'
      ? input.assignmentsUpdatedAt
      : JSON.stringify(assignments) === JSON.stringify(base.assignments)
        ? 0
        : Date.now()

  const sessions = isObject(input.sessions) ? (input.sessions as AppState['sessions']) : base.sessions

  return { version: 1, exercises, customPrograms, assignments, assignmentsUpdatedAt, sessions }
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return createDefaultState()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    return normalizeState(JSON.parse(raw)) ?? createDefaultState()
  } catch {
    return createDefaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Stockage plein ou bloqué (navigation privée) : l'app continue sans sauvegarde.
  }
}

/** Texte JSON de la sauvegarde, pour l'export. */
export function exportState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

/** Lit un fichier de sauvegarde. Renvoie null s'il est invalide. */
export function parseImportedState(text: string): AppState | null {
  try {
    return normalizeState(JSON.parse(text))
  } catch {
    return null
  }
}
