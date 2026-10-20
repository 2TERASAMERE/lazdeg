import { DEFAULT_ASSIGNMENTS } from './data'
import { STORAGE_KEY } from './config'
import type { AppState } from './types'

/**
 * Couche de sauvegarde.
 * Aujourd'hui : localStorage (données sur cet appareil uniquement).
 * Plus tard : remplacer le contenu de ces fonctions par des appels Supabase,
 * sans toucher au reste de l'app.
 */

export function createDefaultState(): AppState {
  return { version: 1, customPrograms: [], assignments: [...DEFAULT_ASSIGNMENTS], sessions: {} }
}

/** Valide et normalise un objet inconnu (sauvegarde locale ou fichier importé). */
export function normalizeState(input: unknown): AppState | null {
  if (!input || typeof input !== 'object') return null
  const raw = input as Partial<AppState>
  if (raw.version !== 1) return null
  const base = createDefaultState()
  return {
    version: 1,
    customPrograms: Array.isArray(raw.customPrograms) ? raw.customPrograms : base.customPrograms,
    assignments:
      Array.isArray(raw.assignments) && raw.assignments.length === 7 ? raw.assignments : base.assignments,
    sessions: raw.sessions && typeof raw.sessions === 'object' ? raw.sessions : base.sessions,
  }
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
