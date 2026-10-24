'use client'

import { useMemo, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { formatShortDate } from '@/lib/dates'
import type { SessionLog } from '@/lib/types'

interface Props {
  sessions: Record<string, SessionLog>
}

/** Historique des séances terminées : liste déroulante + résumé texte (copiable). */
export function SessionHistory({ sessions }: Props) {
  const [pickedId, setPickedId] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'error'>('idle')

  const finished = useMemo(
    () =>
      Object.values(sessions)
        .filter((s) => !!s.summary)
        .sort((a, b) => b.date.localeCompare(a.date) || (b.finishedAt ?? 0) - (a.finishedAt ?? 0)),
    [sessions],
  )

  const selected = finished.find((s) => s.id === pickedId) ?? finished[0]

  const copy = async () => {
    if (!selected?.summary) return
    try {
      await navigator.clipboard.writeText(selected.summary)
      setCopyState('ok')
    } catch {
      setCopyState('error')
    }
    window.setTimeout(() => setCopyState('idle'), 2500)
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h2>Historique des séances</h2>
          <p>Retrouve le résumé de chaque séance terminée.</p>
        </div>
      </div>

      {!selected ? (
        <p className="data-note">
          Aucune séance terminée pour l’instant. Appuie sur « Terminer & partager la séance » pour l’ajouter
          ici.
        </p>
      ) : (
        <>
          <label className="history-select-label">
            <span>Séance</span>
            <select
              className="history-select"
              value={selected.id}
              onChange={(e) => {
                setPickedId(e.target.value)
                setCopyState('idle')
              }}
            >
              {finished.map((s) => (
                <option key={s.id} value={s.id}>
                  {formatShortDate(s.date)} · {s.programName}
                </option>
              ))}
            </select>
          </label>

          <pre className="share-preview history-summary" tabIndex={0} aria-label="Résumé de la séance">
            {selected.summary}
          </pre>

          <div className="data-actions">
            <button type="button" className="secondary-button" onClick={copy}>
              {copyState === 'ok' ? <Check size={15} /> : <Copy size={15} />}
              {copyState === 'ok'
                ? 'Résumé copié'
                : copyState === 'error'
                  ? 'Copie impossible : sélectionne le texte'
                  : 'Copier le résumé'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
