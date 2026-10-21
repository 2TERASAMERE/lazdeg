'use client'

import { useMemo, useState } from 'react'
import { ChevronRight, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import { ExerciseIcon } from '@/components/exercise-icon'
import { COACH_NAME } from '@/lib/config'
import { MUSCLE_GROUPS } from '@/lib/data'
import { pluralize } from '@/lib/format'
import type { Exercise, Program } from '@/lib/types'
import { ExerciseForm } from './exercise-form'

const ALL = 'Toutes'

interface Props {
  /** Exercices actifs (non supprimés). */
  exercises: Exercise[]
  /** Programmes actifs, pour avertir avant de supprimer un exercice utilisé. */
  programs: Program[]
  onSave: (exercise: Exercise) => void
  onDelete: (exerciseId: string) => void
}

type Editing = { mode: 'new' } | { mode: 'edit'; id: string } | null

export function GlossaryView({ exercises, programs, onSave, onDelete }: Props) {
  const [filter, setFilter] = useState<string>(ALL)
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)

  const sorted = useMemo(
    () =>
      [...exercises].sort(
        (a, b) =>
          MUSCLE_GROUPS.indexOf(a.muscleGroup) - MUSCLE_GROUPS.indexOf(b.muscleGroup) ||
          a.name.localeCompare(b.name, 'fr'),
      ),
    [exercises],
  )
  const filters = [ALL, ...MUSCLE_GROUPS.filter((g) => exercises.some((e) => e.muscleGroup === g))]
  const activeFilter = filters.includes(filter) ? filter : ALL
  const visible = sorted.filter((e) => activeFilter === ALL || e.muscleGroup === activeFilter)

  const save = (exercise: Exercise) => {
    onSave(exercise)
    setEditing(null)
    setOpenId(exercise.id)
  }

  const remove = (exercise: Exercise) => {
    const used = programs.filter((p) => p.items.some((item) => item.exerciseId === exercise.id)).length
    const warning =
      used > 0
        ? `\n\nIl est utilisé dans ${used} ${pluralize(used, 'programme')} : il n’y apparaîtra plus.`
        : ''
    if (
      window.confirm(
        `Supprimer « ${exercise.name} » du glossaire ?${warning}\n\nTes séances passées gardent cet exercice dans l’historique.`,
      )
    ) {
      onDelete(exercise.id)
      setOpenId(null)
    }
  }

  return (
    <div className="page-content">
      <div className="section-kicker">BASE DE CONNAISSANCES</div>
      <div className="page-title-row">
        <div>
          <h1>Glossaire</h1>
          <p className="muted-copy">Les machines et les réglages de ton programme.</p>
        </div>
        <button
          type="button"
          className="round-add"
          aria-label="Ajouter un exercice"
          onClick={() => setEditing({ mode: 'new' })}
        >
          <Plus size={19} />
        </button>
      </div>

      {editing?.mode === 'new' && <ExerciseForm onSave={save} onCancel={() => setEditing(null)} />}

      <div className="filter-scroll" role="group" aria-label="Filtrer par groupe musculaire">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={activeFilter === item ? 'filter active' : 'filter'}
            aria-pressed={activeFilter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="glossary-list">
        {visible.length === 0 && (
          <div className="rest-day-state">
            <strong>Aucun exercice</strong>
            <span>Touche + pour en ajouter un.</span>
          </div>
        )}
        {visible.map((exercise) => {
          const open = openId === exercise.id
          const isEditing = editing?.mode === 'edit' && editing.id === exercise.id
          return (
            <div className="glossary-item" key={exercise.id}>
              <button
                type="button"
                className="glossary-card"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : exercise.id)}
              >
                <ExerciseIcon type={exercise.icon} />
                <div className="glossary-copy">
                  <strong>{exercise.name}</strong>
                  <span>
                    {exercise.muscleGroup} · {exercise.equipment}
                  </span>
                </div>
                <ChevronRight size={17} className={open ? 'rotate-90' : ''} />
              </button>

              {open && isEditing && (
                <ExerciseForm initial={exercise} onSave={save} onCancel={() => setEditing(null)} />
              )}

              {open && !isEditing && (
                <div className="glossary-details">
                  {exercise.detail && (
                    <div>
                      <span className="detail-label">MUSCLES CIBLÉS</span>
                      <p className="muted-copy" style={{ margin: 0, fontSize: 13 }}>
                        {exercise.detail}
                      </p>
                    </div>
                  )}
                  {exercise.settings.length > 0 && (
                    <div>
                      <span className="detail-label">RÉGLAGES</span>
                      <ul className="settings-list">
                        {exercise.settings.map((setting, i) => (
                          <li key={`${i}-${setting}`}>{setting}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exercise.coachTip && (
                    <div className="coach-tip">
                      <div className="coach-tip-icon">
                        <Sparkles size={15} />
                      </div>
                      <div>
                        <span className="tip-label">Conseil d&apos;{COACH_NAME}</span>
                        <p>{exercise.coachTip}</p>
                      </div>
                    </div>
                  )}
                  <div className="glossary-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditing({ mode: 'edit', id: exercise.id })}
                    >
                      <Pencil size={14} /> Modifier
                    </button>
                    <button type="button" className="danger-button" onClick={() => remove(exercise)}>
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
