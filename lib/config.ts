/** Réglages simples de l'app. À terme, ils viendront du profil utilisateur (Supabase). */
export const USER_NAME = 'Akli'
export const COACH_NAME = 'Olivier'

/** Durées de repos proposées (en secondes) : 30 s, 1 min, 1 min 30, 2 min. */
export const REST_PRESETS = [30, 60, 90, 120] as const

/** Clé unique de sauvegarde locale (voir lib/storage.ts). */
export const STORAGE_KEY = 'fittracker:v1'
