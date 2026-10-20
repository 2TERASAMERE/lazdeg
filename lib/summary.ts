import { COACH_NAME } from './config'
import { capitalize, formatLongDate } from './dates'
import { getExercise } from './data'
import { formatNumber, formatWeight, parseNumber } from './format'
import type { Program, SessionLog } from './types'
import { countSets, sessionVolume } from './workout'

/** Résumé texte prêt à coller dans WhatsApp, SMS ou un e-mail. */
export function buildSummary(session: SessionLog, program: Program): string {
  const { done, total } = countSets(session)
  const lines: string[] = []

  const minutes = session.finishedAt
    ? Math.max(1, Math.round((session.finishedAt - session.startedAt) / 60000))
    : null
  lines.push(`Salut ${COACH_NAME}, voici ma séance : ${program.name}`)
  lines.push(`${capitalize(formatLongDate(session.date))}${minutes ? ` · ${minutes} min` : ''}`)
  lines.push('')

  for (const item of program.items) {
    const exercise = getExercise(item.exerciseId)
    const log = session.exercises[item.exerciseId]
    if (!exercise || !log) continue
    const doneSets = log.sets.filter((s) => s.done)
    lines.push(`${exercise.name} (${doneSets.length}/${log.sets.length})`)
    if (doneSets.length === 0) {
      lines.push('• Non réalisé')
    } else if (exercise.kind === 'cardio') {
      lines.push(`• ${doneSets[0].reps} min`)
    } else {
      lines.push(
        '• ' +
          doneSets
            .map((s) =>
              parseNumber(s.weight) > 0 ? `${formatWeight(s.weight)} kg × ${s.reps}` : `${s.reps} reps`,
            )
            .join(' · '),
      )
    }
    if (log.note.trim()) lines.push(`Ressenti : ${log.note.trim()}`)
    lines.push('')
  }

  lines.push(`Bilan : ${done}/${total} séries · ${formatNumber(sessionVolume(session))} kg de volume`)
  return lines.join('\n')
}
