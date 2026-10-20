import type { WeekDay } from '@/lib/dates'
import type { Program } from '@/lib/types'

interface Props {
  week: WeekDay[]
  todayIso: string
  selected: number
  assignments: (string | null)[]
  programs: Program[]
  onSelect: (index: number) => void
}

export function DayStrip({ week, todayIso, selected, assignments, programs, onSelect }: Props) {
  return (
    <div className="day-strip">
      {week.map((day) => {
        const program = programs.find((p) => p.id === assignments[day.index])
        const classes = [
          'day-card',
          selected === day.index ? 'selected' : '',
          program ? program.accent : 'muted',
          day.iso === todayIso ? 'today' : '',
        ]
          .filter(Boolean)
          .join(' ')
        return (
          <button
            key={day.iso}
            type="button"
            className={classes}
            aria-current={day.iso === todayIso ? 'date' : undefined}
            aria-pressed={selected === day.index}
            onClick={() => onSelect(day.index)}
          >
            <span>{day.short}</span>
            <strong>{day.dayOfMonth}</strong>
            {program && <small>{program.name}</small>}
            {selected === day.index && <i />}
          </button>
        )
      })}
    </div>
  )
}
