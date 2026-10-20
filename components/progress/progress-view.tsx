'use client'

import { useMemo, useRef, useState } from 'react'
import { Download, TrendingUp, Trophy, Upload } from 'lucide-react'
import { addDays, formatDayMonth, formatShortDate } from '@/lib/dates'
import { formatCompact, formatNumber } from '@/lib/format'
import { exportState, parseImportedState } from '@/lib/storage'
import type { AppState } from '@/lib/types'
import { hasProgress, sessionVolume } from '@/lib/workout'

interface Props {
  state: AppState
  todayIso: string
  onImport: (state: AppState) => void
}

export function ProgressView({ state, todayIso, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const sessions = useMemo(
    () =>
      Object.values(state.sessions)
        .filter(hasProgress)
        .sort((a, b) => a.date.localeCompare(b.date) || a.startedAt - b.startedAt)
        .map((session) => ({ session, volume: sessionVolume(session) })),
    [state.sessions],
  )

  const month = todayIso.slice(0, 7)
  const monthCount = sessions.filter((s) => s.session.date.startsWith(month)).length
  const since = addDays(todayIso, -30)
  const volume30 = sessions.filter((s) => s.session.date > since).reduce((sum, s) => sum + s.volume, 0)

  const last6 = sessions.slice(-6)
  const maxVolume = Math.max(1, ...last6.map((s) => s.volume))
  const trend =
    last6.length >= 2 && last6[last6.length - 2].volume > 0
      ? Math.round(
          ((last6[last6.length - 1].volume - last6[last6.length - 2].volume) /
            last6[last6.length - 2].volume) *
            100,
        )
      : null
  const recent = [...sessions].reverse().slice(0, 5)

  const download = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fittracker-sauvegarde-${todayIso}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage({ kind: 'ok', text: 'Sauvegarde téléchargée.' })
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const imported = parseImportedState(await file.text())
    if (!imported) {
      setMessage({ kind: 'error', text: 'Ce fichier n’est pas une sauvegarde FitTracker valide.' })
      return
    }
    if (!window.confirm('Remplacer toutes tes données actuelles par celles de ce fichier ?')) return
    onImport(imported)
    setMessage({ kind: 'ok', text: 'Données restaurées.' })
  }

  return (
    <div className="page-content">
      <div className="section-kicker">DONNÉES & PERFORMANCE</div>
      <div className="page-title-row">
        <div>
          <h1>Ta progression</h1>
          <p className="muted-copy">Les chiffres racontent ton travail.</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="rest-day-state">
          <TrendingUp size={24} />
          <strong>Pas encore de séance</strong>
          <span>Valide ta première série dans l’onglet Séance : ta progression apparaîtra ici.</span>
        </div>
      ) : (
        <>
          <div className="metric-grid">
            <div className="metric-card">
              <span>Volume sur 30 jours</span>
              <strong>
                {formatNumber(volume30)} <small>kg</small>
              </strong>
              {trend !== null && (
                <em>
                  <TrendingUp size={13} /> {trend >= 0 ? '+' : ''}
                  {trend}% vs séance précédente
                </em>
              )}
            </div>
            <div className="metric-card">
              <span>Séances ce mois</span>
              <strong>{monthCount}</strong>
              <em>
                <Trophy size={13} /> {sessions.length} au total
              </em>
            </div>
          </div>

          <div className="panel chart-panel">
            <div className="panel-heading">
              <div>
                <h2>Volume soulevé</h2>
                <p>Sur {last6.length > 1 ? `les ${last6.length} dernières séances` : 'ta dernière séance'}</p>
              </div>
              {trend !== null && (
                <span className="chart-pill">
                  {trend >= 0 ? '+' : ''}
                  {trend}%
                </span>
              )}
            </div>
            <div className="chart">
              <div className="chart-y">
                <span>{formatCompact(maxVolume)}</span>
                <span>{formatCompact(maxVolume / 2)}</span>
                <span>0</span>
              </div>
              <div className="bars">
                {last6.map((s) => (
                  <div className="bar-group" key={s.session.id}>
                    <div
                      className="bar"
                      style={{ height: `${Math.max(6, Math.round((s.volume / maxVolume) * 100))}%` }}
                    />
                    <span>{formatDayMonth(s.session.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel history-panel">
            <div className="panel-heading">
              <div>
                <h2>Dernières séances</h2>
                <p>Ton journal d’entraînement</p>
              </div>
            </div>
            {recent.map((s, i) => (
              <div className="history-item" key={s.session.id}>
                <div className={`history-dot dot-${i % 3}`} />
                <div>
                  <strong>{s.session.programName}</strong>
                  <span>{formatShortDate(s.session.date)}</span>
                </div>
                <div className="history-volume">{formatNumber(s.volume)} kg</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="panel">
        <div className="panel-heading">
          <div>
            <h2>Sauvegarde</h2>
            <p>Tes données sont stockées sur cet appareil.</p>
          </div>
        </div>
        <p className="data-note">
          Si tu vides les données du navigateur ou changes de téléphone, elles seront perdues. Télécharge une
          sauvegarde de temps en temps.
        </p>
        <div className="data-actions">
          <button type="button" className="secondary-button" onClick={download}>
            <Download size={15} /> Exporter
          </button>
          <button type="button" className="secondary-button" onClick={() => fileRef.current?.click()}>
            <Upload size={15} /> Restaurer
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={handleFile} />
        </div>
        {message && (
          <p className={message.kind === 'error' ? 'form-error' : 'data-note'} role="status">
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
