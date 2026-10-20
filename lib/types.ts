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
  exercises: Record<string, ExerciseLog>
}

/** Tout ce qui est sauvegardé. Les programmes par défaut restent dans le code. */
export interface AppState {
  version: 1
  customPrograms: Program[]
  /** Programme prévu pour chaque jour, du lundi (0) au dimanche (6). */
  assignments: (string | null)[]
  sessions: Record<string, SessionLog>
}
