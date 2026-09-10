import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useApp } from '../store/AppContext'
import { MealCard } from '../components/MealCard'
import {
  DEFAULT_RATIOS,
  generateDayMeals,
  minimumMealBudget,
  todayISO,
  SLOTS,
  planIssues,
  validBudget,
} from '../data/meals'
import { MealStatus } from '../components/MealStatus'
import type { MealSlot } from '../types'

export function Meals() {
  const { profile } = useApp()
  return <MealsForm key={`${profile?.dailyBudget}:${profile?.dietaryNotes}`} />
}

function MealsForm() {
  const { profile, todayMeals, regenerateMeals, swapMeal, confirmMeal, showToast } = useApp()
  const [budget, setBudget] = useState(profile?.dailyBudget ?? 60)
  const [ratios, setRatios] = useState(todayMeals?.rules?.ratios ?? { ...DEFAULT_RATIOS })
  const loading = false
  const note = profile?.dietaryNotes ?? ''
  const minimum = minimumMealBudget(note, todayMeals)
  const [generationError, setGenerationError] = useState('')

  const split = useMemo(() => {
    const b = Math.round((budget * ratios.breakfast) / 100)
    const l = Math.round((budget * ratios.lunch) / 100)
    const d = budget - b - l
    return { breakfast: b, lunch: l, dinner: d }
  }, [budget, ratios])

  const ratioSum = ratios.breakfast + ratios.lunch + ratios.dinner

  const adjustRatio = (key: MealSlot, val: number) => {
    const next = { ...ratios, [key]: val }
    const others = (['breakfast', 'lunch', 'dinner'] as MealSlot[]).filter((k) => k !== key)
    const remain = 100 - val
    const otherSum = ratios[others[0]] + ratios[others[1]]
    if (otherSum <= 0) {
      next[others[0]] = Math.floor(remain / 2)
      next[others[1]] = remain - next[others[0]]
    } else {
      next[others[0]] = Math.round((ratios[others[0]] / otherSum) * remain)
      next[others[1]] = remain - next[others[0]]
    }
    setRatios(next)
  }

  const generate = () => {
    if (!validBudget(budget) || ratioSum !== 100) {
      showToast('预算需为 20–300 元，比例之和需为 100%')
      return
    }
    const candidate = generateDayMeals(budget, ratios, note, todayISO(), todayMeals)
    const problems = planIssues(candidate, budget, note)
    if (problems.length) {
      setGenerationError(problems.join(' '))
      showToast('未生成三餐，原餐单和预算已保留')
      return
    }
    setGenerationError('')
    regenerateMeals(budget, ratios)
    showToast(SLOTS.every(slot => candidate.confirmed[slot]) ? '三餐均已确认，保留原用餐记录' : '三餐已生成，已保存预算；确认过的餐次保留')
  }
  const issues = planIssues(todayMeals, profile?.dailyBudget ?? 60, note)

  return (
    <div className="page meals-redesign">
      <header className="page-header meals-hero">
        <div>
          <p className="eyebrow">DAILY MENU · 今日餐单</p>
          <h1>把三餐安排好，<br /><span>把时间留给生活。</span></h1>
          <p className="muted sm">一份预算，三餐灵感。今天也要好好吃饭。</p>
        </div>
        <div className="meal-hero-art" aria-hidden="true"><div className="hero-orbit" /><div className="hero-plate"><span className="plate-greens" /><span className="plate-grain" /><span className="plate-tomato" /></div><span className="hero-sticker">好好吃饭<br /><b>DAY BY DAY</b></span></div>
      </header>

      <div className="meals-workspace">
      <section className="card meals-budget-panel">
        <div className="budget-panel-heading"><span className="meal-step">01</span><div><h2>定个小预算</h2><p>按你的节奏，安排一天</p></div></div>
        <label className="field">
          <span className="field-label">每日餐饮预算 <span className="budget-unit">CNY / 天</span></span>
          <div className="budget-wrap">
            <input
              type="number"
              min={20}
              max={300}
              value={budget}
              onChange={(e) => { setBudget(Number(e.target.value) || 0); setGenerationError('') }}
            />
          </div>
        </label>

        <div className="ratio-block">
          <div className="ratio-block-title">
            <span>三餐分配</span>
            <span className={`hint ${ratioSum === 100 ? '' : 'err'}`}>合计 {ratioSum}%</span>
          </div>
          {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((slot) => (
            <div key={slot} className="ratio-row">
              <span className="meal-tag">
                {slot === 'breakfast' ? '早' : slot === 'lunch' ? '午' : '晚'}
              </span>
              <input
                type="range"
                aria-label={`${slot === 'breakfast' ? '早餐' : slot === 'lunch' ? '午餐' : '晚餐'}比例`}
                min={5}
                max={70}
                value={ratios[slot]}
                onChange={(e) => adjustRatio(slot, Number(e.target.value))}
              />
              <div className="ratio-meta">
                <div className="pct">{ratios[slot]}%</div>
                <div className="amt">¥{split[slot]}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="diet-preference"><span>饮食偏好</span><strong>{note || '无特殊要求'}</strong><Link to="/me">修改 ↗</Link></div>
        <p className="hint budget-save-note">生成成功后保存预算，已确认用餐保持不变。</p>
        {minimum !== null && budget < minimum && <div role="status" className="summary-box">
          <p>当前示例菜单最低需要 ¥{minimum}/天，比输入预算多 ¥{minimum - budget}。这是菜单匹配限制。</p>
          {minimum <= 300 && <button type="button" className="btn ghost sm" onClick={() => { setBudget(minimum); setGenerationError('') }}>填入最低预算 ¥{minimum}</button>}
          <p className="hint">填入后点击“生成三餐”才会保存预算。也可保留当前预算，在高德地图查找餐厅并自行核实价格。</p>
        </div>}
        {generationError && <p role="alert" className="err">{generationError}</p>}
        <div className="row gap wrap">
          <button type="button" className="btn primary grow" onClick={generate} disabled={loading}>
            {loading ? '生成中…' : '生成今日三餐  ↗'}
          </button>
          <button type="button" className="btn ghost" onClick={generate} disabled={loading || !todayMeals}>
            换未确认餐次
          </button>
        </div>
      </section>

      <div className="meals-menu-panel">
      <MealStatus />
      <section className="section">
        <div className="section-head">
          <h2>你的三餐灵感</h2><span className="menu-example-label">示例菜单</span>
        </div>
        {!todayMeals && !loading && <div className="empty-card">输入预算后点击生成</div>}
        {loading && <div className="empty-card">正在匹配菜品…</div>}
        {todayMeals && !loading && (
          <div className="stack">
            {(['breakfast', 'lunch', 'dinner'] as MealSlot[]).map((slot) => (
              <MealCard
                key={slot}
                slot={slot}
                meal={todayMeals[slot]}
                blocked={issues.length > 0}
                confirmed={!!todayMeals.confirmed[slot]}
                onSwap={() => swapMeal(slot)}
                onConfirm={() => confirmMeal(slot)}
              />
            ))}
          </div>
        )}
      </section>
      <Link to="/map" className="meal-map-link"><span className="meal-map-icon">↗</span><span><strong>去附近，发现好味道</strong><small>打开高德地图，探索真实餐厅</small></span><span>→</span></Link>
      </div>
      </div>
    </div>
  )
}
