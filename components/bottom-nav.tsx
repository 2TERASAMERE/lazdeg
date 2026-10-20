import { BarChart3, BookOpen, CalendarDays, Play } from 'lucide-react'
import type { TabId } from '@/lib/types'

const ITEMS = [
  { id: 'workout', label: 'Séance', icon: Play },
  { id: 'program', label: 'Programme', icon: CalendarDays },
  { id: 'glossary', label: 'Glossaire', icon: BookOpen },
  { id: 'progress', label: 'Progression', icon: BarChart3 },
] as const

export function BottomNav({ active, onChange }: { active: TabId; onChange: (tab: TabId) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={active === id ? 'nav-item active' : 'nav-item'}
          aria-current={active === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
