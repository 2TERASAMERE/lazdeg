'use client'

import { useState } from 'react'
import { CalendarDays, ChevronRight, Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { getExercise, isCustomProgram } from '@/lib/data'
import type { WeekDay } from '@/lib/dates'
import { pluralize } from '@/lib/format'
import type { Exercise, Program } from '@/lib/types'
import { ProgramForm } from './program-form'

interface Props {
  /** Exercices actifs, proposés à la création d'un programme. */
  exercises: Exercise[]
  week: WeekDay[]
  programs: Program[]
  assignments: (string | null)[]
  onAssign: (dayIndex: number, programId: string) => void
  onCreate: (program: Program) => void
  onUpdate: (program: Program) => void
  onDelete: (programId: string) => void
}

type Editor = { mode: 'new' } | { mode: 'edit'; id: string } | null

export function ProgramView({
  exercises,
  week,
  programs,
  assignments,
  onAssign,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [editor, setEditor] = useState<Editor>(null)

  const programName = (id: string | null) => programs.find((p) => p.id === id)?.name

  const saveNew = (program: Program) => {
    onCreate(program)
    setEditor(null)
  }

  const saveEdit = (program: Program) => {
    onUpdate(program)
    setEditor(null)
  }

  const duplicate = (program: Program) => {
    const id = `custom-${Date.now()}`
    onCreate({ ...program, id, name: `${program.name} (copie)`, updatedAt: undefined })
    setOpenId(id)
    setEditor({ mode: 'edit', id })
  }

  const remove = (program: Program) => {
    if (
      window.confirm(`Supprimer « ${program.name} » ? Les séances déjà faites restent dans ton historique.`)
    ) {
      onDelete(program.id)
      setOpenId(null)
      setEditor(null)
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
            onClick={() => setEditor({ mode: 'new' })}
          >
            <Plus size={19} />
          </button>
        </div>

        {programs.map((program, index) => {
          const open = openId === program.id
          const isEditing = editor?.mode === 'edit' && editor.id === program.id
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

              {open && isEditing && (
                <ProgramForm
                  exercises={exercises}
                  initial={program}
                  programCount={programs.length}
                  onSave={saveEdit}
                  onCancel={() => setEditor(null)}
                />
              )}

              {open && !isEditing && (
                <div className="program-details">
                  <ul className="program-exercises">
                    {program.items.map((item) => {
                      const exercise = getExercise(item.exerciseId)
                      if (!exercise || exercise.deleted) return null
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
                  <div className="glossary-actions">
                    {isCustomProgram(program) ? (
                      <>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setEditor({ mode: 'edit', id: program.id })}
                        >
                          <Pencil size={14} /> Modifier
                        </button>
                        <button type="button" className="danger-button" onClick={() => remove(program)}>
                          <Trash2 size={14} /> Supprimer
                        </button>
                      </>
                    ) : (
                      <button type="button" className="secondary-button" onClick={() => duplicate(program)}>
                        <Copy size={14} /> Dupliquer pour modifier
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {editor?.mode === 'new' && (
          <ProgramForm
            exercises={exercises}
            programCount={programs.length}
            onSave={saveNew}
            onCancel={() => setEditor(null)}
          />
        )}
      </div>
    </div>
  )
}
