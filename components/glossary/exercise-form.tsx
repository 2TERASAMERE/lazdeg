'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { MUSCLE_GROUPS } from '@/lib/data'
import type { Exercise, ExerciseKind, MuscleGroup } from '@/lib/types'

interface Props {
  /** Absent = création d'un nouvel exercice. */
  initial?: Exercise
  onSave: (exercise: Exercise) => void
  onCancel: () => void
}

function newId() {
  return `custom-ex-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function ExerciseForm({ initial, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [group, setGroup] = useState<MuscleGroup>(initial?.muscleGroup ?? 'Jambes')
  const [kind, setKind] = useState<ExerciseKind>(initial?.kind ?? 'strength')
  const [equipment, setEquipment] = useState(initial?.equipment ?? '')
  const [detail, setDetail] = useState(initial?.detail ?? '')
  const [settings, setSettings] = useState(initial?.settings.join('\n') ?? '')
  const [tip, setTip] = useState(initial?.coachTip ?? '')

  const canSave = name.trim().length > 0

  const save = () => {
    if (!canSave) return
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim(),
      detail: detail.trim(),
      muscleGroup: group,
      kind,
      equipment: equipment.trim() || (kind === 'cardio' ? 'Cardio' : 'Machine guidée'),
      icon: initial?.icon ?? (kind === 'cardio' ? 'bike' : 'dumbbell'),
      settings: settings
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      coachTip: tip.trim(),
      updatedAt: Date.now(),
    })
  }

  return (
    <div className="create-program-card">
      <div className="create-program-heading">
        <div>
          <strong>{initial ? 'Modifier l’exercice' : 'Nouvel exercice'}</strong>
          <span>{initial ? initial.name : 'Renseigne la fiche de la machine.'}</span>
        </div>
        <button type="button" className="icon-button" aria-label="Annuler" onClick={onCancel}>
          <X size={17} />
        </button>
      </div>

      <label>
        <span>Nom</span>
        <input
          autoFocus={!initial}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex. Presse à cuisses"
          autoComplete="off"
        />
      </label>

      <label>
        <span>Groupe musculaire</span>
        <select value={group} onChange={(e) => setGroup(e.target.value as MuscleGroup)}>
          {MUSCLE_GROUPS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Type</span>
        <select value={kind} disabled={!!initial} onChange={(e) => setKind(e.target.value as ExerciseKind)}>
          <option value="strength">Musculation (poids × répétitions)</option>
          <option value="cardio">Cardio (durée)</option>
        </select>
      </label>

      <label>
        <span>Muscles travaillés</span>
        <input
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Ex. Quadriceps · Fessiers"
          autoComplete="off"
        />
      </label>

      <label>
        <span>Matériel</span>
        <input
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          placeholder="Ex. Machine guidée, Poulie, Isolation"
          autoComplete="off"
        />
      </label>

      <label>
        <span>Réglages (un par ligne)</span>
        <textarea
          value={settings}
          onChange={(e) => setSettings(e.target.value)}
          placeholder={'Siège : cran 4\nDossier : cran 2'}
        />
      </label>

      <label>
        <span>Conseil d’Olivier</span>
        <textarea
          value={tip}
          onChange={(e) => setTip(e.target.value)}
          placeholder="Posture, tempo, consignes de sécurité…"
        />
      </label>

      <button type="button" className="finish-button" onClick={save} disabled={!canSave}>
        <Check size={17} /> {initial ? 'Enregistrer' : 'Ajouter au glossaire'}
      </button>
    </div>
  )
}
