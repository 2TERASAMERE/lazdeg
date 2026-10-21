/**
 * Réglages de la synchronisation (voir README, section « Synchronisation »).
 *
 * Colle ici l'adresse du projet Supabase et sa clé PUBLIQUE (« Publishable key », ou « anon key »).
 * Ces deux valeurs sont faites pour être visibles dans le code d'un site : tes données sont
 * protégées par ton mot de passe et par les règles de la base (RLS).
 *
 * ⛔ Ne colle JAMAIS ici la clé « secret » ou « service_role » : elle donne un accès total.
 */
export const SUPABASE_URL = 'https://ufcfjdgfdzgpfvuoxwoa.supabase.co'
export const SUPABASE_PUBLIC_KEY = 'sb_publishable_-IFRExp-G_MvRCMndKONDQ_8YX27yxp'

export const isSyncConfigured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLIC_KEY.length > 20
