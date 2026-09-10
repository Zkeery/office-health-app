import { useState } from 'react'
import { DIET_HELP, validBudget } from '../data/meals'
import { useApp } from '../store/AppContext'
import type { AgeBand, SitHours, TakeoutFreq } from '../types'

export function ProfileEditor({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useApp()
  const [draft, setDraft] = useState(profile!)
  return <form className="card form-grid" onSubmit={event => {
    event.preventDefault()
    if (!validBudget(draft.dailyBudget)) return
    updateProfile({ ...draft, dietaryNotes: draft.dietaryNotes.trim() })
    onClose()
  }}>
    <h2>编辑健康档案</h2>
    <label className="field">年龄段<select value={draft.ageBand} onChange={e => setDraft({ ...draft, ageBand: e.target.value as AgeBand })}>{['22-28','29-35','36-45','46-55'].map(v => <option key={v}>{v}</option>)}</select></label>
    <label className="field">每日久坐时长<select value={draft.sitHours} onChange={e => setDraft({ ...draft, sitHours: e.target.value as SitHours })}>{['6-8','8-10','10+'].map(v => <option key={v}>{v}</option>)}</select></label>
    <label className="field">外卖频率<select value={draft.takeoutFreq} onChange={e => setDraft({ ...draft, takeoutFreq: e.target.value as TakeoutFreq })}>{['偶尔','每周3-4次','几乎每天'].map(v => <option key={v}>{v}</option>)}</select></label>
    <label className="field">每日预算（元）<input type="number" required min="20" max="300" step="0.01" value={draft.dailyBudget} onChange={e => setDraft({ ...draft, dailyBudget: Number(e.target.value) })} /></label>
    <label className="field">饮食要求<input type="text" value={draft.dietaryNotes} onChange={e => setDraft({ ...draft, dietaryNotes: e.target.value })} /></label>
    <p className="hint">{DIET_HELP}</p>
    <p>保存后立即按新预算和饮食要求更新今日未确认餐次；已确认用餐、历史打卡、运动、积分与会员状态保留。</p>
    <div className="row gap"><button className="btn primary" type="submit">保存并更新计划</button><button className="btn ghost" type="button" onClick={onClose}>取消</button></div>
  </form>
}
