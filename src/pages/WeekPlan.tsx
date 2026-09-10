import { StudioHeader } from '../components/StudioHeader'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { getExercise } from '../data/exercises'

export function WeekPlan() {
  const { weekPlans, isMember, todayCompletedExercises, completedExercises } = useApp()

  return (
    <div className="page studio-page week-page">
      <StudioHeader eyebrow={"YOUR WEEK · 七日计划"} title="让好习惯，慢慢发生。" description={"从今天起的七天，安排饮食，也留一点时间给运动。"} symbol="07" />

      {!isMember && (
        <div className="card soft-warn">
          <p>
            <strong>免费版</strong>可查看近 3 天完整计划。开通会员解锁七日完整与动态调整。
          </p>
          <Link to="/membership" className="btn primary sm">
            查看会员
          </Link>
        </div>
      )}

      <div className="stack">
        {weekPlans.map((day, idx) => {
          const locked = !isMember && idx >= 3
          const doneIds = day.isToday
            ? todayCompletedExercises
            : completedExercises[day.date] ?? []
          return (
            <article
              key={day.date}
              className={`week-card ${day.isToday ? 'today' : ''} ${locked ? 'locked' : ''}`}
            >
              <div className="week-card-head">
                <div>
                  <span className="day-label">{day.dayLabel}</span>
                  <span className="day-date">{day.date.slice(5)}</span>
                </div>
                {day.isToday && <span className="pill brand">今天</span>}
                {locked && <span className="pill">会员解锁</span>}
              </div>
              {locked ? (
                <p className="muted">开通会员查看本日饮食焦点与运动安排</p>
              ) : (
                <>
                  <p className="diet-focus">
                    饮食焦点 · <strong>{day.dietFocus}</strong>
                  </p>
                  <ul className="ex-list">
                    {day.exerciseIds.map((id) => {
                      const ex = getExercise(id)
                      if (!ex) return null
                      const done = doneIds.includes(id)
                      return (
                        <li key={id} className={done ? 'done' : ''}>
                          <span>{ex.icon}</span>
                          <span>
                            {ex.name} · {ex.durationMin}′
                          </span>
                          {done && <span className="ok-text">✓</span>}
                        </li>
                      )
                    })}
                  </ul>
                  {day.isToday && (
                    <div className="row gap">
                      <Link to="/meals" className="btn ghost sm">
                        出餐
                      </Link>
                      <Link to="/exercise" className="btn primary sm">
                        去做运动
                      </Link>
                    </div>
                  )}
                </>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
