'use client'

import { useState } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import { ExerciseIcon } from '@/components/exercise-icon'
import { COACH_NAME } from '@/lib/config'
import { EXERCISES, MUSCLE_GROUPS } from '@/lib/data'

const ALL = 'Toutes'

export function GlossaryView() {
  const [filter, setFilter] = useState<string>(ALL)
  const [openId, setOpenId] = useState<string | null>(null)
  const filters = [ALL, ...MUSCLE_GROUPS.filter((g) => EXERCISES.some((e) => e.muscleGroup === g))]
  const visible = EXERCISES.filter((e) => filter === ALL || e.muscleGroup === filter)

  return (
    <div className="page-content">
      <div className="section-kicker">BASE DE CONNAISSANCES</div>
      <div className="page-title-row">
        <div>
          <h1>Glossaire</h1>
          <p className="muted-copy">Les machines et les réglages de ton programme.</p>
        </div>
      </div>

      <div className="filter-scroll" role="group" aria-label="Filtrer par groupe musculaire">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className={filter === item ? 'filter active' : 'filter'}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="glossary-list">
        {visible.map((exercise) => {
          const open = openId === exercise.id
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

              {open && (
                <div className="glossary-details">
                  <div>
                    <span className="detail-label">MUSCLES CIBLÉS</span>
                    <p className="muted-copy" style={{ margin: 0, fontSize: 13 }}>
                      {exercise.detail}
                    </p>
                  </div>
                  <div>
                    <span className="detail-label">RÉGLAGES</span>
                    <ul className="settings-list">
                      {exercise.settings.map((setting) => (
                        <li key={setting}>{setting}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="coach-tip">
                    <div className="coach-tip-icon">
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <span className="tip-label">Conseil d&apos;{COACH_NAME}</span>
                      <p>{exercise.coachTip}</p>
                    </div>
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
