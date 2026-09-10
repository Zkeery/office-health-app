import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { todayISO } from '../data/meals'

export function CheckInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <CheckInForm onClose={onClose} /> : null
}

function CheckInForm({ onClose }: { onClose: () => void }) {
  const { submitCheckIn, checkIns, todayCompletedExercises, todayMeals } = useApp()
  const saved = checkIns.find((c) => c.date === todayISO())
  const already = !!saved
  const recordedMovement = todayCompletedExercises.length > 0
  const [ate, setAte] = useState<boolean | null>(null)
  const [moved, setMoved] = useState<boolean | null>(null)
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5 | null>(null)
  const [note, setNote] = useState('')

  const submit = () => {
    if (!already && ate !== null && (recordedMovement || moved !== null) && energy !== null) {
      submitCheckIn({ ate, moved: recordedMovement || moved === true, energy, note: note.trim() || undefined })
    }
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="checkin-title"
      >
        <p className="eyebrow">DAILY REFLECTION · 今日回顾</p><h2 id="checkin-title">给今天，留个小记录。</h2>
        {already ? (
          <div><p>按时吃饭：{saved?.ate ? '是' : '否'} · 打卡时运动反馈：{saved?.moved ? '是' : '否'}</p><p>今日已记录运动 {todayCompletedExercises.length} 项 · 精力 {saved?.energy}/5</p><p>{saved?.note || '无备注'}</p></div>
        ) : (
          <>
            <p className="hint">已确认 {Object.values(todayMeals?.confirmed ?? {}).filter(Boolean).length}/3 餐；用餐确认不代表按时。今日已记录运动 {todayCompletedExercises.length} 项。</p>
            <label className="field">按时吃饭了吗？
              <select value={ate === null ? '' : String(ate)} onChange={e => setAte(e.target.value === '' ? null : e.target.value === 'true')}>
                <option value="">请选择</option><option value="true">是</option><option value="false">否</option>
              </select>
            </label>
            {recordedMovement ? <p>动起来了：是（来自今日运动记录）</p> : <label className="field">动起来了吗？
              <select value={moved === null ? '' : String(moved)} onChange={e => setMoved(e.target.value === '' ? null : e.target.value === 'true')}>
                <option value="">请选择</option><option value="true">是，另有运动</option><option value="false">否</option>
              </select>
            </label>}
            <div className="field">
              <span className="field-label">今日精力</span>
              <div className="energy-row">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`energy-btn ${energy === n ? 'active' : ''}`}
                    onClick={() => setEnergy(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="hint">1 疲惫 · 5 充沛</p>
            </div>
            <label className="field">
              <span className="field-label">备注（可选）</span>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：午饭吃得清淡"
              />
            </label>
          </>
        )}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>
            关闭
          </button>
          {!already && (
            <button type="button" className="btn primary" onClick={submit} disabled={ate === null || (!recordedMovement && moved === null) || energy === null}>
              提交打卡 +20
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
