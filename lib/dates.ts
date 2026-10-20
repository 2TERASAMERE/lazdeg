const DAY_SHORT = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export interface WeekDay {
  /** 0 = lundi … 6 = dimanche */
  index: number
  short: string
  dayOfMonth: number
  /** Date locale AAAA-MM-JJ */
  iso: string
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** 0 = lundi … 6 = dimanche */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

/** Les 7 jours de la semaine (lundi → dimanche) qui contient `today`. */
export function getWeek(today: Date): WeekDay[] {
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - weekdayIndex(today))
  return DAY_SHORT.map((short, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index)
    return { index, short, dayOfMonth: date.getDate(), iso: toISODate(date) }
  })
}

const longFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const shortFormat = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

/** « mardi 20 octobre 2026 » */
export function formatLongDate(iso: string): string {
  return longFormat.format(fromISODate(iso))
}

/** « mar. 20 oct. » */
export function formatShortDate(iso: string): string {
  return shortFormat.format(fromISODate(iso))
}

/** « 20/10 » */
export function formatDayMonth(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}
