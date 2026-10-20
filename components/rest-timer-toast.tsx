import type { CSSProperties } from 'react'
import { Check, SkipForward, X } from 'lucide-react'
import type { RestStatus } from '@/hooks/use-rest-timer'
import { formatClock } from '@/lib/format'

interface Props {
  status: Exclude<RestStatus, 'idle'>
  remaining: number
  total: number
  onAdjust: (deltaSeconds: number) => void
  onStop: () => void
}

export function RestTimerToast({ status, remaining, total, onAdjust, onStop }: Props) {
  const done = status === 'done'
  const progress = done ? 100 : total > 0 ? Math.min(100, Math.round((remaining / total) * 100)) : 0

  return (
    <div className={done ? 'rest-toast done' : 'rest-toast'} role="status">
      <div className="rest-ring" style={{ '--progress': progress } as CSSProperties} aria-hidden="true">
        <span>{done ? <Check size={20} strokeWidth={3} /> : formatClock(remaining)}</span>
      </div>
      <div className="rest-info">
        <strong>{done ? 'Repos terminé' : 'Temps de repos'}</strong>
        <span>{done ? 'C’est reparti : prochaine série.' : 'Respire, on repart bientôt.'}</span>
      </div>
      <div className="rest-actions">
        {!done && (
          <>
            <button type="button" aria-label="Retirer 15 secondes" onClick={() => onAdjust(-15)}>
              −15
            </button>
            <button type="button" aria-label="Ajouter 15 secondes" onClick={() => onAdjust(15)}>
              +15
            </button>
          </>
        )}
        <button
          type="button"
          className="rest-skip"
          aria-label={done ? 'Fermer' : 'Passer le repos'}
          onClick={onStop}
        >
          {done ? <X size={18} /> : <SkipForward size={18} />}
        </button>
      </div>
    </div>
  )
}
