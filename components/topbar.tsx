import { Zap } from 'lucide-react'
import { USER_NAME } from '@/lib/config'

export function Topbar() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Zap size={18} fill="currentColor" strokeWidth={2.5} />
        </div>
        <div>
          <strong>
            FIT<span>TRACKER</span>
          </strong>
          <small>GUIDED BY OLIVIER</small>
        </div>
      </div>
      <div className="top-actions">
        <span className="avatar" aria-hidden="true">
          {USER_NAME.charAt(0).toUpperCase()}
        </span>
      </div>
    </header>
  )
}
