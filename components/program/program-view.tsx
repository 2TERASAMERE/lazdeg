'use client'

import { useState } from 'react'
import { CalendarDays, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import { EXERCISES, MUSCLE_GROUPS, getExercise, isCustomProgram } from '@/lib/data'
import type { WeekDay } from '@/lib/dates'
import { pluralize } from '@/lib/format'
import type { Accent, PlannedExercise, Program } from '@/lib/types'

interface Props {
  week: WeekDay[]
  programs: Program[]
  assignments: (string | null)[]
  onAssign: (dayIndex: number, programId: string) => void
  onCreate: (program: Program) => void
  onDelete: (programId: string) => void
}

const ACCENTS: Accent[] = ['amber', 'blue', 'violet']

export function ProgramView({ week, programs, assignments, onAssign, onCreate, onDelete }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [name, setName] = useState('')
  const [duration, setDuration] = useState('45')
  const [selected, setSelected] = useState<string[]>([])

  const programName = (id: string | null) => programs.find((p) => p.id === id)?.name

  const toggleExercise = (id: string) =>
    setSelected((items) => (items.includes(id) ? items.filter((x) => x !== id) : [...items, id]))

  const canCreate = name.trim().length > 0 && selected.length > 0

  const create = () => {
    if (!canCreate) return
    const items: PlannedExercise[] = EXERCISES.filter((e) => selected.includes(e.id)).map((e) => ({
      exerciseId: e.id,
      sets: e.kind === 'cardio' ? 1 : 3,
      target: 10,
      restSeconds: e.kind === 'cardio' ? 0 : 60,
    }))
    onCreate({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      accent: ACCENTS[programs.length % ACCENTS.length],
      durationMin: Math.max(5, parseInt(duration, 10) || 45),
      items,
    })
    setName('')
    setDuration('45')
    setSelected([])
    setShowCreate(false)
  }

  const remove = (program: Program) => {
    if (
      window.confirm(`Supprimer « ${program.name} » ? Les séances déjà faites restent dans ton historique.`)
    ) {
      onDelete(program.id)
      setOpenId(null)
    }
  }

  return (
    <div className="page-content empty-program">
      <div className="section-kicker">PROGRAMME HEBDOMADAIRE</div>
      <h1>Ton programme</h1>
      <p className="muted-copy">
        Assigne une séance à chaque jour de la semaine. Elle apparaît ensuite automatiquement dans Séance.
      </p>

      <div className="planner-card">
        <div className="planner-heading">
          <div>
            <h2>Quel programme quel jour ?</h2>
            <p>Touche une séance pour l’assigner, touche-la encore pour libérer le jour.</p>
          </div>
          <CalendarDays size={20} />
        </div>
        <div className="planner-days">
          {week.map((day) => (
            <div className="planner-day" key={day.iso}>
              <div className="planner-day-label">
                <strong>
                  {day.short} {day.dayOfMonth}
                </strong>
                <span>{programName(assignments[day.index]) ?? 'Repos'}</span>
              </div>
              <div className="planner-options">
                {programs.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className={
                      assignments[day.index] === program.id ? 'planner-option selected' : 'planner-option'
                    }
                    onClick={() => onAssign(day.index, program.id)}
                    aria-pressed={assignments[day.index] === program.id}
                  >
                    {program.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="program-library">
        <div className="section-heading">
          <div>
            <h2>Tes séances</h2>
            <p>Touche une séance pour voir ses exercices.</p>
          </div>
          <button
            type="button"
            className="round-add"
            aria-label="Créer un programme"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={19} />
          </button>
        </div>

        {programs.map((program, index) => {
          const open = openId === program.id
          return (
            <div className={open ? 'program-block open' : 'program-block'} key={program.id}>
              <button
                type="button"
                className="program-card"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : program.id)}
              >
                <div
                  className={`program-number ${index % 3 === 1 ? 'blue-number' : index % 3 === 2 ? 'purple-number' : ''}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
                <div>
                  <strong>{program.name}</strong>
                  <span>
                    {program.items.length} {pluralize(program.items.length, 'exercice')} ·{' '}
                    {program.durationMin} min
                  </span>
                </div>
                <ChevronRight size={18} className={open ? 'rotate-90' : ''} />
              </button>
              {open && (
                <div className="program-details">
                  <ul className="program-exercises">
                    {program.items.map((item) => {
                      const exercise = getExercise(item.exerciseId)
                      if (!exercise) return null
                      return (
                        <li key={item.exerciseId}>
                          <span>{exercise.name}</span>
                          <small>
                            {exercise.kind === 'cardio'
                              ? `${item.target} min`
                              : `${item.sets} × ${item.target}`}
                          </small>
                        </li>
                      )
                    })}
                  </ul>
                  {isCustomProgram(program) && (
                    <button type="button" className="danger-button" onClick={() => remove(program)}>
                      <Trash2 size={14} /> Supprimer ce programme
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {showCreate && (
          <div className="create-program-card">
            <div className="create-program-heading">
              <div>
                <strong>Nouveau programme</strong>
                <span>Choisis un nom et les exercices à inclure.</span>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Fermer"
                onClick={() => setShowCreate(false)}
              >
                <X size={17} />
              </button>
            </div>
            <label>
              <span>Nom du programme</span>
              <input
                autoFocus
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
            {MUSCLE_GROUPS.map((group) => {
              const list = EXERCISES.filter((e) => e.muscleGroup === group)
              if (list.length === 0) return null
              return (
                <div className="picker-group" key={group}>
                  <p className="picker-title">{group.toUpperCase()}</p>
                  <div className="picker-chips">
                    {list.map((exercise) => (
                      <button
                        key={exercise.id}
                        type="button"
                        className={selected.includes(exercise.id) ? 'picker-chip selected' : 'picker-chip'}
                        aria-pressed={selected.includes(exercise.id)}
                        onClick={() => toggleExercise(exercise.id)}
                      >
                        {exercise.name}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            <button type="button" className="finish-button" onClick={create} disabled={!canCreate}>
              <Plus size={17} /> Créer le programme
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
