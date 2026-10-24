import { Check, Minus, Plus } from 'lucide-react'
import type { ExerciseKind, SetLog } from '@/lib/types'

interface Props {
  number: number
  set: SetLog
  kind: ExerciseKind
  onChange: (field: 'weight' | 'reps', value: string) => void
  onToggle: () => void
}

const selectAll = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.select()

export function SetRow({ number, set, kind, onChange, onToggle }: Props) {
  const cardio = kind === 'cardio'
  const classes = ['set-row', cardio ? 'cardio' : '', set.done ? 'set-done' : ''].filter(Boolean).join(' ')

  // Boutons +/− : on part de la valeur saisie (vide ou invalide = 0), sans jamais descendre sous 0.
  const reps = parseInt(set.reps, 10) || 0
  const stepReps = (delta: number) => onChange('reps', String(Math.max(0, reps + delta)))
  const unitLabel = cardio ? 'minutes' : 'répétitions'

  return (
    <div className={classes}>
      <span className="set-number">{number}</span>
      {!cardio && (
        <>
          <input
            aria-label={`Poids de la série ${number}, en kilos`}
            className="set-input"
            type="text"
            inputMode="decimal"
            enterKeyHint="next"
            autoComplete="off"
            value={set.weight}
            onFocus={selectAll}
            onChange={(e) => onChange('weight', e.target.value)}
          />
          <span className="unit">kg</span>
        </>
      )}
      <div className="stepper">
        <input
          aria-label={cardio ? 'Durée en minutes' : `Répétitions de la série ${number}`}
          className="set-input reps"
          type="text"
          inputMode="numeric"
          enterKeyHint="done"
          autoComplete="off"
          value={set.reps}
          onFocus={selectAll}
          onChange={(e) => onChange('reps', e.target.value)}
        />
        <button
          type="button"
          className="step-button"
          aria-label={`Retirer une unité (${unitLabel}, série ${number})`}
          disabled={reps <= 0}
          onClick={() => stepReps(-1)}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          className="step-button"
          aria-label={`Ajouter une unité (${unitLabel}, série ${number})`}
          onClick={() => stepReps(1)}
        >
          <Plus size={16} />
        </button>
      </div>
      {cardio && <span className="unit">min</span>}
      <button
        type="button"
        className={set.done ? 'set-check checked' : 'set-check'}
        aria-pressed={set.done}
        aria-label={set.done ? `Série ${number} validée, appuyer pour annuler` : `Valider la série ${number}`}
        onClick={onToggle}
      >
        {set.done && <Check size={22} strokeWidth={3} />}
      </button>
    </div>
  )
}
