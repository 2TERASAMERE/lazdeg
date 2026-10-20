import type { Exercise, MuscleGroup, Program } from './types'

/**
 * Catalogue des machines et exercices.
 * ⚠️ Les réglages et les conseils ci-dessous sont des textes d'exemple :
 * remplace-les par les vrais conseils d'Olivier.
 */
export const EXERCISES: Exercise[] = [
  {
    id: 'velo-droit',
    name: 'Vélo droit',
    detail: 'Échauffement',
    muscleGroup: 'Cardio',
    kind: 'cardio',
    equipment: 'Cardio',
    icon: 'bike',
    settings: [
      'Selle : jambe presque tendue en bas de la pédalée',
      'Résistance : légère, tu dois pouvoir parler',
    ],
    coachTip: 'Cadence progressive. Garde une respiration régulière et ne force pas sur les genoux.',
  },
  {
    id: 'leg-press',
    name: 'Leg Press inclinée',
    detail: 'Quadriceps · Fessiers',
    muscleGroup: 'Jambes',
    kind: 'strength',
    equipment: 'Machine guidée',
    icon: 'dumbbell',
    settings: [
      'Dossier : le bassin reste collé pendant toute la poussée',
      'Pieds : largeur de hanches, au milieu de la plateforme',
      'Butées de sécurité : à régler avant de charger',
    ],
    coachTip:
      'Pieds largeur de hanches, genoux dans l’axe des orteils. Descends en 3 secondes et ne verrouille pas les genoux.',
  },
  {
    id: 'leg-extension',
    name: 'Leg Extension',
    detail: 'Quadriceps',
    muscleGroup: 'Jambes',
    kind: 'strength',
    equipment: 'Isolation',
    icon: 'gauge',
    settings: ['Dossier : le creux du genou au bord de l’assise', 'Boudin : juste au-dessus des chevilles'],
    coachTip: 'Dos bien calé contre le dossier. Marque une seconde en haut, puis contrôle la descente.',
  },
  {
    id: 'mollets-assis',
    name: 'Mollets assis',
    detail: 'Mollets',
    muscleGroup: 'Jambes',
    kind: 'strength',
    equipment: 'Isolation',
    icon: 'flame',
    settings: ['Siège : genoux à environ 90°', 'Cale-cuisses : bien posé sur le bas des cuisses'],
    coachTip: 'Amplitude complète : étire en bas, pousse fort sur la pointe et garde le mouvement fluide.',
  },
  {
    id: 'chest-press',
    name: 'Développé couché machine',
    detail: 'Pectoraux · Triceps',
    muscleGroup: 'Pectoraux',
    kind: 'strength',
    equipment: 'Machine guidée',
    icon: 'dumbbell',
    settings: [
      'Siège : poignées à hauteur de milieu de poitrine',
      'Dossier : omoplates serrées contre le pad',
    ],
    coachTip:
      'Omoplates serrées contre le dossier. Pousse en expirant, reviens en 2 secondes sans claquer les plaques.',
  },
  {
    id: 'pec-deck',
    name: 'Pec Deck',
    detail: 'Pectoraux',
    muscleGroup: 'Pectoraux',
    kind: 'strength',
    equipment: 'Isolation',
    icon: 'gauge',
    settings: ['Siège : coudes à hauteur d’épaules', 'Amplitude : bras jamais en arrière du buste'],
    coachTip:
      'Coudes légèrement fléchis. Ferme sans taper les poignées, ouvre jusqu’à l’étirement, pas plus.',
  },
  {
    id: 'shoulder-press',
    name: 'Développé épaules machine',
    detail: 'Épaules · Triceps',
    muscleGroup: 'Épaules',
    kind: 'strength',
    equipment: 'Machine guidée',
    icon: 'dumbbell',
    settings: ['Siège : poignées à hauteur d’oreilles au départ', 'Dossier : dos plaqué, pas de cambrure'],
    coachTip: 'Abdos gainés, dos plaqué. Ne verrouille pas les coudes en haut et ne cambre pas.',
  },
  {
    id: 'lateral-raise',
    name: 'Élévations latérales',
    detail: 'Deltoïdes latéraux',
    muscleGroup: 'Épaules',
    kind: 'strength',
    equipment: 'Isolation',
    icon: 'gauge',
    settings: ['Siège : épaules à hauteur de l’axe de rotation', 'Charge : légère, tempo lent'],
    coachTip: 'Monte les coudes, pas les mains, jusqu’à l’horizontale. Pas d’élan.',
  },
  {
    id: 'triceps-pushdown',
    name: 'Triceps poulie haute',
    detail: 'Triceps',
    muscleGroup: 'Bras',
    kind: 'strength',
    equipment: 'Poulie',
    icon: 'dumbbell',
    settings: ['Poulie : position haute', 'Accessoire : corde ou barre droite'],
    coachTip:
      'Coudes collés au corps, seuls les avant-bras bougent. Tends complètement, remonte en contrôlant.',
  },
  {
    id: 'lat-pulldown',
    name: 'Tirage vertical',
    detail: 'Grand dorsal · Biceps',
    muscleGroup: 'Dos',
    kind: 'strength',
    equipment: 'Poulie',
    icon: 'dumbbell',
    settings: ['Cale-cuisses : serrés sur le haut des cuisses', 'Prise : un peu plus large que les épaules'],
    coachTip:
      'Poitrine sortie, tire vers le haut de la poitrine en menant avec les coudes. Pas de balancement du buste.',
  },
  {
    id: 'seated-row',
    name: 'Rowing assis',
    detail: 'Dos · Biceps',
    muscleGroup: 'Dos',
    kind: 'strength',
    equipment: 'Machine guidée',
    icon: 'dumbbell',
    settings: [
      'Pad de poitrine : à régler pour garder les bras tendus au départ',
      'Siège : poignées à hauteur de poitrine',
    ],
    coachTip: 'Dos droit, tire les coudes vers l’arrière et serre les omoplates une seconde.',
  },
  {
    id: 'reverse-pec-deck',
    name: 'Oiseau inversé',
    detail: 'Arrière d’épaule · Haut du dos',
    muscleGroup: 'Dos',
    kind: 'strength',
    equipment: 'Isolation',
    icon: 'gauge',
    settings: ['Siège : poignées à hauteur d’épaules', 'Pad de poitrine : bien calé'],
    coachTip:
      'Poitrine contre le pad, bras quasi tendus. Ouvre en serrant l’arrière des épaules, tempo lent.',
  },
  {
    id: 'biceps-curl',
    name: 'Curl biceps poulie basse',
    detail: 'Biceps',
    muscleGroup: 'Bras',
    kind: 'strength',
    equipment: 'Poulie',
    icon: 'dumbbell',
    settings: ['Poulie : position basse', 'Accessoire : barre droite ou barre EZ'],
    coachTip:
      'Coudes fixes le long du corps. Monte en expirant, redescends en 3 secondes sans lâcher la tension.',
  },
  {
    id: 'ab-crunch',
    name: 'Crunch machine',
    detail: 'Abdominaux',
    muscleGroup: 'Abdos',
    kind: 'strength',
    equipment: 'Machine guidée',
    icon: 'flame',
    settings: ['Siège : axe de rotation à hauteur du bas des côtes', 'Charge : modérée, mouvement contrôlé'],
    coachTip:
      'Enroule la colonne en rapprochant le thorax du bassin, expire en contractant. Ne tire pas avec les bras.',
  },
]

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Jambes',
  'Pectoraux',
  'Dos',
  'Épaules',
  'Bras',
  'Abdos',
  'Cardio',
]

const EXERCISES_BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]))

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES_BY_ID.get(id)
}

/**
 * Programmes d'Olivier. Les charges de départ (`startWeight`) sont des exemples :
 * elles servent uniquement à la toute première séance, ensuite l'historique prend le relais.
 */
export const DEFAULT_PROGRAMS: Program[] = [
  {
    id: 'legs',
    name: 'Jambes & Mollets',
    accent: 'amber',
    durationMin: 55,
    items: [
      { exerciseId: 'velo-droit', sets: 1, target: 10, restSeconds: 0 },
      { exerciseId: 'leg-press', sets: 4, target: 10, startWeight: 80, restSeconds: 90 },
      { exerciseId: 'leg-extension', sets: 3, target: 12, startWeight: 35, restSeconds: 60 },
      { exerciseId: 'mollets-assis', sets: 4, target: 15, startWeight: 45, restSeconds: 60 },
    ],
  },
  {
    id: 'push',
    name: 'Push',
    accent: 'blue',
    durationMin: 50,
    items: [
      { exerciseId: 'chest-press', sets: 4, target: 10, startWeight: 40, restSeconds: 90 },
      { exerciseId: 'pec-deck', sets: 3, target: 12, startWeight: 35, restSeconds: 60 },
      { exerciseId: 'shoulder-press', sets: 3, target: 10, startWeight: 25, restSeconds: 90 },
      { exerciseId: 'lateral-raise', sets: 3, target: 15, startWeight: 8, restSeconds: 60 },
      { exerciseId: 'triceps-pushdown', sets: 3, target: 12, startWeight: 20, restSeconds: 60 },
    ],
  },
  {
    id: 'pull',
    name: 'Pull',
    accent: 'violet',
    durationMin: 55,
    items: [
      { exerciseId: 'lat-pulldown', sets: 4, target: 10, startWeight: 45, restSeconds: 90 },
      { exerciseId: 'seated-row', sets: 4, target: 10, startWeight: 40, restSeconds: 90 },
      { exerciseId: 'reverse-pec-deck', sets: 3, target: 15, startWeight: 25, restSeconds: 60 },
      { exerciseId: 'biceps-curl', sets: 3, target: 12, startWeight: 15, restSeconds: 60 },
      { exerciseId: 'ab-crunch', sets: 3, target: 15, startWeight: 30, restSeconds: 60 },
    ],
  },
]

/** Lundi → dimanche. */
export const DEFAULT_ASSIGNMENTS: (string | null)[] = ['legs', null, 'push', null, 'pull', null, null]

export function isCustomProgram(program: Program): boolean {
  return program.id.startsWith('custom-')
}
