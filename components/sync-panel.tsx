'use client'

import { useState } from 'react'
import { Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react'
import type { SyncController } from '@/hooks/use-sync'

function time(ts: number) {
  return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function SyncPanel({ sync }: { sync: SyncController }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { status } = sync

  return (
    <div className="panel">
      <div className="panel-heading">
        <div>
          <h2>Synchronisation</h2>
          <p>Retrouve tes données sur tous tes appareils.</p>
        </div>
        {status === 'unconfigured' ? <CloudOff size={20} /> : <Cloud size={20} />}
      </div>

      {status === 'unconfigured' && (
        <p className="data-note">
          La synchronisation n’est pas encore activée. Les étapes sont dans le fichier <strong>README</strong>
          , section « Synchronisation ». Tant qu’elle n’est pas activée, tout reste enregistré sur cet
          appareil.
        </p>
      )}

      {status === 'loading' && <p className="data-note">Chargement…</p>}

      {(status === 'signed-out' || (status === 'error' && !sync.email)) && (
        <form
          className="sync-form"
          onSubmit={(e) => {
            e.preventDefault()
            void sync.signIn(email, password)
          }}
        >
          <label>
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Mot de passe</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="finish-button" disabled={!email || !password}>
            Se connecter
          </button>
        </form>
      )}

      {sync.email && (
        <>
          <p className="data-note">
            Connecté : <strong>{sync.email}</strong>
            <br />
            {status === 'syncing'
              ? 'Synchronisation en cours…'
              : sync.lastSyncedAt
                ? `Dernière synchronisation à ${time(sync.lastSyncedAt)}.`
                : 'Pas encore synchronisé.'}
          </p>
          <div className="data-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => void sync.syncNow()}
              disabled={status === 'syncing'}
            >
              <RefreshCw size={15} /> Synchroniser
            </button>
            <button type="button" className="secondary-button" onClick={() => void sync.signOut()}>
              <LogOut size={15} /> Déconnexion
            </button>
          </div>
        </>
      )}

      {sync.error && (
        <p className="form-error" role="alert">
          {sync.error}
        </p>
      )}
    </div>
  )
}
