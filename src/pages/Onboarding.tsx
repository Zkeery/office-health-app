import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { DIET_HELP, validBudget } from '../data/meals'
import type { AgeBand, SitHours, TakeoutFreq } from '../types'

const AGES: AgeBand[] = ['22-28', '29-35', '36-45', '46-55']
const SIT: SitHours[] = ['6-8', '8-10', '10+']
const TAKEOUT: TakeoutFreq[] = ['偶尔', '每周3-4次', '几乎每天']

export function Onboarding({ review = false }: { review?: boolean }) {
  const { completeOnboarding, profile } = useApp()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [ageBand, setAgeBand] = useState<AgeBand>(review && profile ? profile.ageBand : '29-35')
  const [sitHours, setSitHours] = useState<SitHours>(review && profile ? profile.sitHours : '8-10')
  const [takeoutFreq, setTakeoutFreq] = useState<TakeoutFreq>(review && profile ? profile.takeoutFreq : '每周3-4次')
  const [dailyBudget, setDailyBudget] = useState(review && profile ? profile.dailyBudget : 60)
  const [dietaryNotes, setDietaryNotes] = useState(review && profile ? profile.dietaryNotes : '')

  const finish = () => {
    if (review) {
      nav('/me', { replace: true })
      return
    }
    if (!validBudget(dailyBudget)) return
    completeOnboarding({
      ageBand,
      sitHours,
      takeoutFreq,
      dailyBudget,
      dietaryNotes: dietaryNotes.trim(),
      completedAt: new Date().toISOString(),
    })
    nav('/', { replace: true })
  }

  return (
    <div className="phone-shell onboarding studio-onboarding">
      <div className="onboard-hero">
        <div className="badge">为久坐上班族定制</div>
        <p className="onboard-wordmark">工位行动 / A LITTLE BETTER</p><h1>从了解你开始。</h1>
        <p className="tagline">几个小问题，为你安排更合适的三餐与运动。</p>
      </div>

      {review && <div className="summary-box">
        <p>重新查看引导 · 本次操作仅供体验，不会保存修改或清除记录。</p>
        <button type="button" className="btn ghost sm" onClick={() => nav('/me', { replace: true })}>退出引导，返回我的</button>
      </div>}

      <div className="card">
        <div className="step-dots">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`dot ${step === i ? 'on' : ''} ${step > i ? 'done' : ''}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="form-grid">
            <div className="field">
              <span className="field-label">年龄段</span>
              <div className="chip-row">
                {AGES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`chip ${ageBand === a ? 'active' : ''}`}
                    onClick={() => setAgeBand(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <span className="field-label">每日久坐时长</span>
              <div className="chip-row">
                {SIT.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`chip ${sitHours === s ? 'active' : ''}`}
                    onClick={() => setSitHours(s)}
                  >
                    {s} 小时
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="form-grid">
            <div className="field">
              <span className="field-label">外卖频率</span>
              <div className="chip-row">
                {TAKEOUT.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${takeoutFreq === t ? 'active' : ''}`}
                    onClick={() => setTakeoutFreq(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="field-label">每日餐饮预算（元）</span>
              <div className="budget-wrap">
                <input
                  type="number"
                  min={20}
                  max={300}
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                />
              </div>
              <p className="hint">预算范围 20–300 元。默认按早 20% / 午 40% / 晚 40% 拆分，可在「出餐」调整</p>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="form-grid">
            <label className="field">
              <span className="field-label">饮食备注</span>
              <input
                type="text"
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                placeholder="例如：素食、不吃辣"
              />
              <p className="hint">{DIET_HELP}</p>
            </label>
            <div className="summary-box">
              <p>
                <strong>{ageBand}</strong> · 久坐 <strong>{sitHours}h</strong>
              </p>
              <p>
                外卖 {takeoutFreq} · 预算 <strong>¥{dailyBudget}</strong>/天
              </p>
            </div>
          </div>
        )}

        <div className="onboard-actions">
          {step > 0 && (
            <button type="button" className="btn ghost" onClick={() => setStep((s) => s - 1)}>
              上一步
            </button>
          )}
          {step < 2 ? (
            <button type="button" className="btn primary grow" onClick={() => setStep((s) => s + 1)}>
              继续
            </button>
          ) : (
            <button type="button" className="btn primary grow" onClick={finish} disabled={!review && !validBudget(dailyBudget)}>
              {review ? '查看完毕，返回我的' : '进入工位行动'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
