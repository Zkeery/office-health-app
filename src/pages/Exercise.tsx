import { StudioHeader } from '../components/StudioHeader'
import { useEffect, useState } from 'react'
import { EXERCISES } from '../data/exercises'
import { useApp } from '../store/AppContext'
import { todayISO } from '../data/meals'

type Session = { id: string; remaining: number; deadline: number | null; date: string }
export function Exercise() {
  const { todayCompletedExercises, completeExercise } = useApp()
  const [session, setSession] = useState<Session | null>(null)
  const [manual, setManual] = useState<string | null>(null)
  useEffect(() => {
    const timer = window.setInterval(() => setSession(current => {
      if (!current) return current
      if (current.date !== todayISO()) return null
      if (!current.deadline) return current
      const remaining = Math.max(0, Math.ceil((current.deadline - Date.now()) / 1000))
      return { ...current, remaining, deadline: remaining ? current.deadline : null }
    }), 200)
    return () => window.clearInterval(timer)
  }, [])
  const finish = (id: string) => { completeExercise(id); setSession(null); setManual(null) }
  return <div className="page studio-page exercise-page">
    <StudioHeader eyebrow={"MOVE A LITTLE · 碎片运动"} title="离开椅子，舒展一下。" description={"2–10 分钟，给身体一点松弛。含热身与休息，离开本页将结束计时。"} symbol="↗" />
    <div className="stack">{EXERCISES.map(ex => {
      const done = todayCompletedExercises.includes(ex.id)
      const active = session?.id === ex.id ? session : null
      const elapsed = ex.durationMin * 60 - (active?.remaining ?? ex.durationMin * 60)
      let end = 0
      const stage = ex.steps.find(step => { end += step.seconds; return elapsed < end })
      return <article id={ex.id} key={ex.id} className={`ex-card ${done ? 'done' : ''}`}>
        <div className="ex-card-top"><span className="ex-ico lg">{ex.icon}</span><div className="grow"><div className="row between"><h3>{ex.name}</h3><span className="pill">{ex.category}</span></div><p className="muted sm">{ex.durationMin} 分钟 · 约 {ex.calories} kcal（估算）</p></div></div>
        <p className="ex-desc">{ex.description}</p>
        <details><summary>动作安排（含休息）</summary><ol>{ex.steps.map((step, i) => <li key={i}>{step.seconds} 秒：{step.instruction}</li>)}</ol></details>
        {active && <div className="timer-bar"><p>{active.remaining === 0 ? '计时结束，请确认实际完成' : `${active.deadline ? '进行中' : '已暂停'} · 剩余 ${Math.floor(active.remaining / 60)}:${String(active.remaining % 60).padStart(2, '0')}`}</p><p>{stage?.instruction}</p><div className="progress-track"><div className="progress-fill" style={{ width: `${elapsed / (ex.durationMin * 60) * 100}%` }} /></div></div>}
        <div className="row gap wrap">
          {done ? <span className="pill ok">今日已完成</span> : <>
            {!active && <button className="btn ghost sm" disabled={!!session} onClick={() => setSession({ id: ex.id, remaining: ex.durationMin * 60, deadline: Date.now() + ex.durationMin * 60000, date: todayISO() })}>开始</button>}
            {active && active.remaining > 0 && <button className="btn ghost sm" onClick={() => setSession({ ...active, remaining: active.deadline ? Math.max(0, Math.ceil((active.deadline - Date.now()) / 1000)) : active.remaining, deadline: active.deadline ? null : Date.now() + active.remaining * 1000 })}>{active.deadline ? '暂停' : '继续'}</button>}
            {active && <button className="btn ghost sm" onClick={() => setSession(null)}>结束本次</button>}
            <button className="btn primary sm" disabled={!active || active.remaining > 0 || active.date !== todayISO()} onClick={() => finish(ex.id)}>确认完成</button>
            {!active && !session && <button className="btn ghost sm" onClick={() => setManual(ex.id)}>补记已做运动</button>}
          </>}
        </div>
        {manual === ex.id && !done && <div className="summary-box"><p>仅当你今天已自行完成「{ex.name}」时补记。补记与计时完成共用每日一次积分，不会重复奖励。</p><button className="btn primary sm" onClick={() => finish(ex.id)}>我已完成，记录一次</button><button className="btn ghost sm" onClick={() => setManual(null)}>取消</button></div>}
      </article>
    })}</div>
  </div>
}
