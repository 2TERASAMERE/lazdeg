'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, MessageCircle, Share2 } from 'lucide-react'
import { COACH_NAME, USER_NAME } from '@/lib/config'
import { formatShortDate } from '@/lib/dates'
import { formatNumber, pluralize } from '@/lib/format'
import type { Program, SessionLog } from '@/lib/types'
import { countSets, sessionVolume } from '@/lib/workout'
/** Mettre à true pour réactiver le bouton WhatsApp. */
const WHATSAPP_ENABLED = false

interface Props {
  program: Program
  session: SessionLog
  summary: string
  onClose: () => void
}

export function ShareModal({ program, session, summary, onClose }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'ok' | 'error'>('idle')
  const [canShare, setCanShare] = useState(false)
  const { done, total } = countSets(session)
  const missing = total - done

  useEffect(() => {
    setCanShare(typeof navigator.share === 'function')
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      setCopyState('ok')
    } catch {
      setCopyState('error')
    }
    window.setTimeout(() => setCopyState('idle'), 2500)
  }

  const nativeShare = () => {
    navigator.share({ title: `Séance ${program.name}`, text: summary }).catch(() => {
      /* partage annulé */
    })
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-handle" />
        <div className="modal-icon">
          <Share2 size={22} />
        </div>
        <h2 id="share-title">Bien joué, {USER_NAME}.</h2>
        <p>
          Ta séance {program.name} est enregistrée. Envoie le résumé à {COACH_NAME}.
        </p>

        <div className="share-summary">
          <strong>
            {program.name} · {formatShortDate(session.date)}
          </strong>
          <span>
            {done} {pluralize(done, 'série')} · {formatNumber(sessionVolume(session))} kg
          </span>
          {missing === 0 ? (
            <span className="share-highlight">
              <Check size={14} /> Toutes les séries validées
            </span>
          ) : (
            <span>
              {missing} {pluralize(missing, 'série')} non {pluralize(missing, 'validée')}
            </span>
          )}
        </div>

        <pre className="share-preview" tabIndex={0} aria-label="Résumé de la séance">
          {summary}
        </pre>

        <div className="share-actions">
          {WHATSAPP_ENABLED && (
  <a
    className="finish-button"
    href={`https://wa.me/?text=${encodeURIComponent(summary)}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <MessageCircle size={17} /> Envoyer sur WhatsApp
  </a>
)}
          {canShare && (
            <button type="button" className="secondary-button" onClick={nativeShare}>
              <Share2 size={16} /> Partager…
            </button>
          )}
          <button type="button" className="secondary-button" onClick={copy}>
            {copyState === 'ok' ? <Check size={16} /> : <Copy size={16} />}
            {copyState === 'ok'
              ? 'Résumé copié'
              : copyState === 'error'
                ? 'Copie impossible : sélectionne le texte'
                : 'Copier le résumé'}
          </button>
        </div>
        <button type="button" className="cancel-button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}
