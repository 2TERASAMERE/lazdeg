'use client'

import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import { Check, GripVertical, X } from 'lucide-react'
import { MUSCLE_GROUPS } from '@/lib/data'
import type { Accent, Exercise, PlannedExercise, Program } from '@/lib/types'

const ACCENTS: Accent[] = ['amber', 'blue', 'violet']
const ROW_GAP = 8

/** Un exercice en cours d'édition : séries et reps restent du texte pour pouvoir effacer le champ. */
interface Draft {
  exerciseId: string
  sets: string
  target: string
  startWeight?: number
  restSeconds: number
}

interface DragState {
  from: number
  to: number
  dy: number
  step: number
}

interface Props {
  /** Exercices actifs du glossaire. */
  exercises: Exercise[]
  /** Absent = création d'un nouveau programme. */
  initial?: Program
  /** Nombre de programmes existants, pour choisir la couleur d'un nouveau programme. */
  programCount: number
  onSave: (program: Program) => void
  onCancel: () => void
}

function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to) return list
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

const toInt = (value: string, fallback: number, min: number, max: number) =>
  Math.min(max, Math.max(min, parseInt(value, 10) || fallback))

export function ProgramForm({ exercises, initial, programCount, onSave, onCancel }: Props) {
  const byId = new Map(exercises.map((e) => [e.id, e]))

  const [name, setName] = useState(initial?.name ?? '')
  const [duration, setDuration] = useState(String(initial?.durationMin ?? 45))
  const [items, setItems] = useState<Draft[]>(() =>
    (initial?.items ?? [])
      .filter((item) => byId.has(item.exerciseId))
      .map((item) => ({
        exerciseId: item.exerciseId,
        sets: String(item.sets),
        target: String(item.target),
        startWeight: item.startWeight,
        restSeconds: item.restSeconds,
      })),
  )
  const [drag, setDrag] = useState<DragState | null>(null)
  const startY = useRef(0)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])

  const patch = (index: number, changes: Partial<Draft>) =>
    setItems((list) => list.map((d, i) => (i === index ? { ...d, ...changes } : d)))

  const add = (exercise: Exercise) => {
    const cardio = exercise.kind === 'cardio'
    setItems((list) => [
      ...list,
      { exerciseId: exercise.id, sets: cardio ? '1' : '3', target: '10', restSeconds: cardio ? 0 : 60 },
    ])
  }

  const remove = (index: number) => setItems((list) => list.filter((_, i) => i !== index))

  // ── Glisser-déposer : la ligne suit le doigt, les autres s'écartent, l'ordre change au relâchement.
  const onDragStart = (e: PointerEvent<HTMLButtonElement>, index: number) => {
    const row = rowRefs.current[index]
    if (!row) return
    e.currentTarget.setPointerCapture(e.pointerId)
    startY.current = e.clientY
    setDrag({ from: index, to: index, dy: 0, step: row.offsetHeight + ROW_GAP })
  }

  const onDragMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (!drag) return
    const dy = e.clientY - startY.current
    const to = Math.min(items.length - 1, Math.max(0, drag.from + Math.round(dy / drag.step)))
    setDrag({ ...drag, dy, to })
  }

  const onDragEnd = () => {
    if (!drag) return
    const { from, to } = drag
    setItems((list) => move(list, from, to))
    setDrag(null)
  }

  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      setItems((list) => move(list, index, index - 1))
    } else if (e.key === 'ArrowDown' && index < items.length - 1) {
      e.preventDefault()
      setItems((list) => move(list, index, index + 1))
    }
  }

  const rowStyle = (index: number): CSSProperties | undefined => {
    if (!drag) return undefined
    if (index === drag.from) return { transform: `translateY(${drag.dy}px)` }
    if (drag.from < drag.to && index > drag.from && index <= drag.to)
      return { transform: `translateY(${-drag.step}px)` }
    if (drag.to < drag.from && index >= drag.to && index < drag.from)
      return { transform: `translateY(${drag.step}px)` }
    return undefined
  }

  const canSave = name.trim().length > 0 && items.length > 0

  const save = () => {
    if (!canSave) return
    const planned: PlannedExercise[] = items.map((d) => {
      const cardio = byId.get(d.exerciseId)?.kind === 'cardio'
      const item: PlannedExercise = {
        exerciseId: d.exerciseId,
        sets: cardio ? 1 : toInt(d.sets, 3, 1, 10),
        target: toInt(d.target, 10, 1, cardio ? 180 : 100),
        restSeconds: d.restSeconds,
      }
      if (d.startWeight !== undefined) item.startWeight = d.startWeight
      return item
    })
    onSave({
      ...initial,
      id: initial?.id ?? `custom-${Date.now()}`,
      name: name.trim(),
      accent: initial?.accent ?? ACCENTS[programCount % ACCENTS.length],
      durationMin: Math.max(5, parseInt(duration, 10) || 45),
      items: planned,
    })
  }

  const available = exercises.filter((e) => !items.some((d) => d.exerciseId === e.id))

  return (
    <div className="create-program-card">
      <div className="create-program-heading">
        <div>
          <strong>{initial ? 'Modifier le programme' : 'Nouveau programme'}</strong>
          <span>
            {initial ? initial.name : 'Choisis un nom, les exercices, leurs séries et leurs répétitions.'}
          </span>
        </div>
        <button type="button" className="icon-button" aria-label="Annuler" onClick={onCancel}>
          <X size={17} />
        </button>
      </div>

      <label>
        <span>Nom du programme</span>
        <input
          autoFocus={!initial}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Haut du corps"
          autoComplete="off"
        />
      </label>
      <label>
        <span>Durée estimée (minutes)</span>
        <input
          value={duration}
          inputMode="numeric"
          onChange={(e) => setDuration(e.target.value.replace(/\D/g, ''))}
          placeholder="45"
        />
      </label>

      <div className="picker-group">
        <p className="picker-title">EXERCICES DU PROGRAMME ({items.length})</p>
        {items.length === 0 ? (
          <p className="data-note">Ajoute des exercices ci-dessous.</p>
        ) : (
          <>
            <p className="data-note" style={{ margin: 0 }}>
              Maintiens ⠿ et glisse pour changer l’ordre.
            </p>
            <div className="program-items">
              {items.map((d, i) => {
                const exercise = byId.get(d.exerciseId)
                const cardio = exercise?.kind === 'cardio'
                const dragging = drag?.from === i
                return (
                  <div
                    key={d.exerciseId}
                    ref={(el) => {
                      rowRefs.current[i] = el
                    }}
                    className={dragging ? 'program-item is-dragging' : 'program-item'}
                    style={rowStyle(i)}
                  >
                    <div className="program-item-head">
                      <button
                        type="button"
                        className="drag-handle"
                        aria-label={`Déplacer ${exercise?.name ?? 'l’exercice'} (glisser, ou flèches haut et bas)`}
                        onPointerDown={(e) => onDragStart(e, i)}
                        onPointerMove={onDragMove}
                        onPointerUp={onDragEnd}
                        onPointerCancel={onDragEnd}
                        onKeyDown={(e) => onHandleKey(e, i)}
                      >
                        <GripVertical size={18} />
                      </button>
                      <div className="program-item-name">
                        <strong>{exercise?.name}</strong>
                        <small>{exercise?.muscleGroup}</small>
                      </div>
                      <button
                        type="button"
                        className="icon-button program-item-remove"
                        aria-label={`Retirer ${exercise?.name ?? 'l’exercice'}`}
                        onClick={() => remove(i)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="program-item-fields">
                      {cardio ? (
                        <div className="field-inline">
                          <span>Durée</span>
                          <input
                            aria-label={`Durée en minutes pour ${exercise?.name}`}
                            inputMode="numeric"
                            value={d.target}
                            onChange={(e) => patch(i, { target: e.target.value.replace(/\D/g, '') })}
                          />
                          <span>min</span>
                        </div>
                      ) : (
                        <>
                          <div className="field-inline">
                            <span>Séries</span>
                            <input
                              aria-label={`Nombre de séries pour ${exercise?.name}`}
                              inputMode="numeric"
                              value={d.sets}
                              onChange={(e) => patch(i, { sets: e.target.value.replace(/\D/g, '') })}
                            />
                          </div>
                          <span className="field-times">×</span>
                          <div className="field-inline">
                            <span>Reps</span>
                            <input
                              aria-label={`Nombre de répétitions pour ${exercise?.name}`}
                              inputMode="numeric"
                              value={d.target}
                              onChange={(e) => patch(i, { target: e.target.value.replace(/\D/g, '') })}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {available.length > 0 && <p className="picker-title">AJOUTER UN EXERCICE</p>}
      {MUSCLE_GROUPS.map((group) => {
        const list = available.filter((e) => e.muscleGroup === group)
        if (list.length === 0) return null
        return (
          <div className="picker-group" key={group}>
            <p className="picker-title">{group.toUpperCase()}</p>
            <div className="picker-chips">
              {list.map((exercise) => (
                <button key={exercise.id} type="button" className="picker-chip" onClick={() => add(exercise)}>
                  + {exercise.name}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      <button type="button" className="finish-button" onClick={save} disabled={!canSave}>
        <Check size={17} /> {initial ? 'Enregistrer les modifications' : 'Créer le programme'}
      </button>
    </div>
  )
}
