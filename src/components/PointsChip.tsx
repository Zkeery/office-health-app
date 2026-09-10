import { useApp } from '../store/AppContext'

export function PointsChip({ compact = false }: { compact?: boolean }) {
  const { points, isMember } = useApp()
  return (
    <div className={`points-chip ${compact ? 'compact' : ''}`} title="当前积分">
      <span className="pts-icon">✦</span>
      <span className="pts-val">{points}</span>
      {!compact && <span className="pts-label">积分</span>}
      {isMember && <span className="member-dot" title="会员双倍">VIP</span>}
    </div>
  )
}
