import type { MealItem, MealSlot } from '../types'
import { MEAL_LABEL } from '../data/meals'

export function MealCard({
  slot,
  meal,
  budget,
  confirmed,
  onSwap,
  onConfirm,
  showActions = true,
  blocked = false,
}: {
  slot: MealSlot
  meal: MealItem | null
  budget?: number
  confirmed?: boolean
  onSwap?: () => void
  onConfirm?: () => void
  showActions?: boolean
  blocked?: boolean
}) {
  if (!meal) {
    return (
      <div className={`meal-card empty meal-${slot}`}>
        <div className="meal-slot">{MEAL_LABEL[slot]}</div>
        <p className="muted">暂无符合当前条件的推荐，请查看餐单提示</p>
      </div>
    )
  }
  return (
    <div className={`meal-card meal-${slot} ${confirmed ? 'confirmed' : ''}`}>
      <div className="meal-card-top">
        <span className="meal-slot">{MEAL_LABEL[slot]}</span>
        {confirmed && <span className="pill ok">已确认</span>}
        {meal.spicy ? <span className="pill warn">微辣</span> : <span className="pill ok">不辣</span>}
      </div>
      <h3 className="meal-name">{meal.name}</h3>
      <p className="meal-rest">{meal.restaurant} · 模拟餐厅</p>
      <div className="meal-meta">
        <span className="price">¥{meal.price}</span>
        {budget != null && <span className="budget-hint">预算 ¥{budget}</span>}
        <div className="tags">
          {meal.tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>
      {showActions && (
        <div className="meal-actions">
          {onSwap && !confirmed && (
            <button type="button" className="btn ghost sm" onClick={onSwap}>
              换一餐
            </button>
          )}
          {onConfirm && !confirmed && (
            <button type="button" className="btn primary sm" onClick={onConfirm} disabled={blocked}>
              我已用餐
            </button>
          )}
        </div>
      )}
    </div>
  )
}
