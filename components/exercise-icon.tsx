import { Activity, Dumbbell, Flame, Gauge } from 'lucide-react'
import type { ExerciseIcon as IconType } from '@/lib/types'

const ICONS = { bike: Activity, gauge: Gauge, flame: Flame, dumbbell: Dumbbell } as const

export function ExerciseIcon({ type }: { type: IconType }) {
  const Icon = ICONS[type]
  return (
    <div className="exercise-icon">
      <Icon size={20} />
    </div>
  )
}
