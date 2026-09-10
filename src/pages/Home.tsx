import { StudioHeader } from '../components/StudioHeader'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { MealCard } from '../components/MealCard'
import { ProgressBar } from '../components/ProgressBar'
import { CheckInModal } from '../components/CheckInModal'
import { getExercise } from '../data/exercises'
import { todayISO, planIssues } from '../data/meals'
import { MealStatus } from '../components/MealStatus'
import type { MealSlot } from '../types'

export function Home() {
  const {
    profile,
    todayMeals,
    ensureTodayMeals,
    confirmMeal,
    weekPlans,
    weekCheckInCount,
    weeklyCheckInTarget,
    todayCompletedExercises,
    checkIns,
    points,
  } = useApp()
  const [checkOpen, setCheckOpen] = useState(false)
  const checkedToday = checkIns.some((c) => c.date === todayISO())

  useEffect(() => {
    ensureTodayMeals()
  }, [ensureTodayMeals])

  const todayPlan = weekPlans[0]
  const microIds = todayPlan?.exerciseIds ?? []

  return (
    <div className="page studio-page home-page">
      <StudioHeader eyebrow={<>TODAY · {todayISO()}</>} title="今天，也照顾好自己。" description={<>预算 ¥{profile?.dailyBudget ?? 60} · {profile?.dietaryNotes || '无特殊忌口'}。从一顿饭、一次伸展开始。</>} symbol="☀" />

      <Link to="/map" className="home-map-banner"><span>⌖ 附近有好去处</span><span>探索真实餐厅 →</span></Link>

      <section className="card highlight">
        <div className="row between">
          <div>
            <p className="eyebrow">本周成就</p>
            <ProgressBar
              value={weekCheckInCount}
              max={weeklyCheckInTarget}
              label={`打卡 ${weekCheckInCount}/${weeklyCheckInTarget}`}
            />
          </div>
          <div className="points-big">
            <span className="num">{points}</span>
            <span className="lab">积分</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>今日餐单</h2>
          <Link to="/meals" className="link">
            去出餐 →
          </Link>
        </div>
        <MealStatus />
        {todayMeals ? (
          <div className="stack">
            {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((slot) => (
              <MealCard
                key={slot}
                slot={slot}
                meal={todayMeals[slot]}
                confirmed={!!todayMeals.confirmed[slot]}
                onConfirm={() => confirmMeal(slot)}
                blocked={planIssues(todayMeals, profile?.dailyBudget ?? 60, profile?.dietaryNotes ?? '').length > 0}
                showActions
              />
            ))}
          </div>
        ) : (
          <div className="empty-card">加载餐单中…</div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <h2>碎片运动</h2>
          <Link to="/exercise" className="link">
            全部 →
          </Link>
        </div>
        <div className="stack">
          {microIds.map((id) => {
            const ex = getExercise(id)
            if (!ex) return null
            const done = todayCompletedExercises.includes(id)
            return (
              <div key={id} className={`ex-mini ${done ? 'done' : ''}`}>
                <span className="ex-ico">{ex.icon}</span>
                <div className="grow">
                  <strong>{ex.name}</strong>
                  <p className="muted sm">
                    {ex.durationMin} 分钟 · 约 {ex.calories} kcal
                  </p>
                </div>
                {done ? <span className="pill ok">已完成</span> : <Link className="btn sm primary" to={`/exercise#${id}`}>开始运动</Link>}
              </div>
            )
          })}
        </div>
      </section>

      <button
        type="button"
        className="btn primary block cta"
        onClick={() => setCheckOpen(true)}
      >
        {checkedToday ? '查看今日打卡' : '立即打卡反馈 +20'}
      </button>

      <p className="hint center">
        今日饮食焦点：{todayPlan?.dietFocus}
        {todayMeals &&
          ` · 已确认 ${Object.values(todayMeals.confirmed).filter(Boolean).length}/3 餐`}
      </p>

      <CheckInModal open={checkOpen} onClose={() => setCheckOpen(false)} />
    </div>
  )
}
