'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type RestStatus = 'idle' | 'running' | 'done'

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext }

function playEndSignal(ctx: AudioContext) {
  const now = ctx.currentTime
  ;[0, 0.22, 0.44].forEach((offset, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = i === 2 ? 1175 : 880
    gain.gain.setValueAtTime(0.0001, now + offset)
    gain.gain.exponentialRampToValueAtTime(0.25, now + offset + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now + offset)
    osc.stop(now + offset + 0.2)
  })
}

/**
 * Chronomètre de repos.
 * Il s'appuie sur l'heure de fin (et non sur un compteur décrémenté) : si l'écran se verrouille
 * ou si l'onglet passe en arrière-plan, le temps restant reste exact au retour.
 */
export function useRestTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<RestStatus>('idle')
  const audioRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (endsAt === null) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) {
        setEndsAt(null)
        setStatus('done')
        navigator.vibrate?.([200, 100, 200])
        if (audioRef.current) playEndSignal(audioRef.current)
      }
    }
    tick()
    const id = window.setInterval(tick, 250)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [endsAt])

  // Le bandeau « Repos terminé » disparaît seul après quelques secondes.
  useEffect(() => {
    if (status !== 'done') return
    const id = window.setTimeout(() => setStatus('idle'), 5000)
    return () => window.clearTimeout(id)
  }, [status])

  const start = useCallback((seconds: number) => {
    if (seconds <= 0) return
    // Le son ne peut être débloqué que pendant un geste de l'utilisateur : start() est appelé au tap sur ✓.
    try {
      if (!audioRef.current) {
        const Ctx = window.AudioContext ?? (window as AudioWindow).webkitAudioContext
        if (Ctx) audioRef.current = new Ctx()
      }
      void audioRef.current?.resume()
    } catch {
      // Pas de son : la vibration et l'affichage suffisent.
    }
    setTotal(seconds)
    setRemaining(seconds)
    setEndsAt(Date.now() + seconds * 1000)
    setStatus('running')
  }, [])

  const adjust = useCallback(
    (deltaSeconds: number) => {
      if (endsAt === null) return
      const next = endsAt + deltaSeconds * 1000
      const left = Math.ceil((next - Date.now()) / 1000)
      setTotal((t) => Math.max(t, left))
      setEndsAt(next)
    },
    [endsAt],
  )

  const stop = useCallback(() => {
    setEndsAt(null)
    setRemaining(0)
    setStatus('idle')
  }, [])

  return { status, remaining, total, start, adjust, stop }
}
