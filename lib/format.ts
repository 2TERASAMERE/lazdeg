const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

/** Convertit un texte saisi (« 82,5 » ou « 82.5 ») en nombre. Vide ou invalide → 0. */
export function parseNumber(value: string): number {
  const n = parseFloat(value.replace(',', '.'))
  return Number.isFinite(n) ? n : 0
}

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

/** « 82.5 » → « 82,5 » */
export function formatWeight(value: string): string {
  return formatNumber(parseNumber(value))
}

/** 4200 → « 4,2k » ; 800 → « 800 » */
export function formatCompact(value: number): string {
  if (value >= 1000) return `${numberFormat.format(Math.round(value / 100) / 10)}k`
  return String(Math.round(value))
}

/** 83 → « 1:23 » */
export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/** 90 → « 1 min 30 », 30 → « 30 s » */
export function formatRestLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s === 0 ? `${m} min` : `${m} min ${s}`
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count > 1 ? plural : singular
}
