export type MuscleGroup = 'Jambes' | 'Pectoraux' | 'Dos' | 'Épaules' | 'Bras' | 'Abdos' | 'Cardio'
export type ExerciseKind = 'strength' | 'cardio'
export type Accent = 'amber' | 'blue' | 'violet'
export type ExerciseIcon = 'bike' | 'gauge' | 'flame' | 'dumbbell'
export type TabId = 'workout' | 'program' | 'glossary' | 'progress'

/** Fiche d'un exercice / d'une machine (catalogue = glossaire). */
export interface Exercise {
  id: string
  name: string
  /** Muscles travaillés, affichés sous le nom. */
  detail: string
  muscleGroup: MuscleGroup
  /** `cardio` = une seule ligne « durée » ; `strength` = séries poids × reps. */
  kind: ExerciseKind
  equipment: string
  icon: ExerciseIcon
  /** Réglages matériels (siège, dossier, poulie…). */
  settings: string[]
  /** « Conseil d'Olivier » : sécurité, posture, tempo. */
  coachTip: string
  /** Date de dernière modification (ms). Sert à fusionner les appareils. */
  updatedAt: number
  /** Supprimé du glossaire. L'exercice reste connu pour l'historique des séances. */
  deleted?: boolean
}

/** Un exercice dans un programme. */
export interface PlannedExercise {
  exerciseId: string
  sets: number
  /** Répétitions visées (musculation) ou minutes (cardio). */
  target: number
  /** Charge de départ en kg, utilisée tant qu'il n'y a pas d'historique. */
  startWeight?: number
  /** Repos après chaque série, en secondes (0 = pas de chrono). */
  restSeconds: number
}

export interface Program {
  id: string
  name: string
  accent: Accent
  durationMin: number
  items: PlannedExercise[]
  updatedAt?: number
  deleted?: boolean
}

export interface SetLog {
  /** Texte saisi (virgule ou point acceptés). */
  weight: string
  reps: string
  done: boolean
  doneAt?: number
}

export interface ExerciseLog {
  sets: SetLog[]
  note: string
  restSeconds: number
}

/** Une séance réalisée (ou en cours) un jour donné. */
export interface SessionLog {
  id: string
  /** Date locale AAAA-MM-JJ. */
  date: string
  programId: string
  /** Copie du nom, pour garder l'historique lisible si le programme est supprimé. */
  programName: string
  startedAt: number
  finishedAt?: number
  /** Dernière modification (ms), pour la synchronisation. */
  updatedAt?: number
  /** Résumé texte figé à la fin de la séance (affiché dans l'historique de Progression). */
  summary?: string
  exercises: Record<string, ExerciseLog>
}

/** Tout ce qui est sauvegardé (et synchronisé). Les programmes d'Olivier restent dans le code. */
export interface AppState {
  version: 1
  /** Catalogue complet (exercices d'origine + les tiens), y compris les supprimés. */
  exercises: Exercise[]
  /** Programmes créés par l'utilisateur, y compris les supprimés. */
  customPrograms: Program[]
  /** Programme prévu pour chaque jour, du lundi (0) au dimanche (6). */
  assignments: (string | null)[]
  assignmentsUpdatedAt: number
  sessions: Record<string, SessionLog>
}
