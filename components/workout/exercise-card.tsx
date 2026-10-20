import { ChevronRight, History, Sparkles, TimerReset } from 'lucide-react'
import { ExerciseIcon } from '@/components/exercise-icon'
import { COACH_NAME, REST_PRESETS } from '@/lib/config'
import { formatClock, formatRestLabel } from '@/lib/format'
import type { Exercise, ExerciseLog } from '@/lib/types'
import { SetRow } from './set-row'

interface Props {
  index: number
  exercise: Exercise
  log: ExerciseLog
  /** Texte de rappel de la séance précédente (« 80 kg × 10 ») ou null. */
  previous: string | null
  expanded: boolean
  onToggleExpanded: () => void
  onField: (setIndex: number, field: 'weight' | 'reps', value: string) => void
  onToggleSet: (setIndex: number) => void
  onNote: (note: string) => void
  onRestSeconds: (seconds: number) => void
}

export function ExerciseCard({
  index,
  exercise,
  log,
  previous,
  expanded,
  onToggleExpanded,
  onField,
  onToggleSet,
  onNote,
  onRestSeconds,
}: Props) {
  const cardio = exercise.kind === 'cardio'
  const doneCount = log.sets.filter((s) => s.done).length
  const complete = doneCount === log.sets.length

  return (
    <article className={expanded ? 'exercise-card is-expanded' : 'exercise-card'}>
      <button type="button" className="exercise-heading" onClick={onToggleExpanded} aria-expanded={expanded}>
        <div className="exercise-heading-left">
          <span className="exercise-order">0{index + 1}</span>
          <ExerciseIcon type={exercise.icon} />
          <div>
            <h3>{exercise.name}</h3>
            <p>{exercise.detail}</p>
          </div>
        </div>
        <div className="exercise-heading-right">
          <span className="progress-mini" style={complete ? { color: 'var(--primary)' } : undefined}>
            {doneCount}/{log.sets.length}
          </span>
          <ChevronRight size={18} className={expanded ? 'rotate-90' : ''} />
        </div>
      </button>

      {expanded && (
        <div className="exercise-body">
          <div className="coach-tip">
            <div className="coach-tip-icon">
              <Sparkles size={15} />
            </div>
            <div>
              <span className="tip-label">Conseil d&apos;{COACH_NAME}</span>
              <p>{exercise.coachTip}</p>
            </div>
          </div>

          <div className="history-line">
            <History size={14} /> Dernière séance <strong>{previous ?? '—'}</strong>
          </div>

          {!cardio && (
            <div className="rest-presets" role="group" aria-label={`Temps de repos pour ${exercise.name}`}>
              <TimerReset size={14} />
              <span className="rest-presets-label">Repos</span>
              {REST_PRESETS.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  className={log.restSeconds === seconds ? 'rest-chip active' : 'rest-chip'}
                  aria-pressed={log.restSeconds === seconds}
                  aria-label={formatRestLabel(seconds)}
                  onClick={() => onRestSeconds(seconds)}
                >
                  {formatClock(seconds)}
                </button>
              ))}
            </div>
          )}

          <div className={cardio ? 'sets-head cardio' : 'sets-head'}>
            <span>Série</span>
            <span>{cardio ? 'Durée' : 'Poids'}</span>
            {!cardio && <span>Reps</span>}
            <span className="sr-only">Valider</span>
          </div>
          <div className="sets-list">
            {log.sets.map((set, i) => (
              <SetRow
                key={i}
                number={i + 1}
                set={set}
                kind={exercise.kind}
                onChange={(field, value) => onField(i, field, value)}
                onToggle={() => onToggleSet(i)}
              />
            ))}
          </div>

          <label className="note-wrap">
            <span>Note de ressenti</span>
            <input
              value={log.note}
              onChange={(e) => onNote(e.target.value)}
              placeholder="Comment tu te sens sur cet exercice ?"
              autoComplete="off"
            />
          </label>
        </div>
      )}
    </article>
  )
}
