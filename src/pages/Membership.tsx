import { StudioHeader } from '../components/StudioHeader'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../store/AppContext'

const FREE = [
  '今日餐单与基础出餐',
  '近 3 日七日计划',
  '每日有限换餐',
  '标准积分获取',
  '碎片运动库',
]

const VIP = [
  '七日完整滚动计划',
  '饮食/运动动态调整',
  '无限换餐 / 换整天',
  '积分加倍（×2）',
  '阶段奖励加速解锁',
  '专属饮食焦点建议',
]

export function Membership() {
  const { isMember, setMember, showToast } = useApp()
  const nav = useNavigate()

  return (
    <div className="page studio-page membership-page">
      <StudioHeader eyebrow={"GO FURTHER · 会员中心"} title="给坚持，多一点动力。" description={"选择适合你的行动计划。当前为本地演示，不会实际扣款。"} symbol="✦" />

      {isMember && (
        <div className="card ok-banner">
          <strong>你已是工位行动会员</strong>
          <p className="muted sm">积分加倍、七日完整计划与无限换餐已生效</p>
        </div>
      )}

      <div className="compare">
        <div className="card plan">
          <h3>免费版</h3>
          <p className="price-line">¥0</p>
          <ul>
            {FREE.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="card plan vip">
          <div className="vip-badge">推荐</div>
          <h3>会员</h3>
          <p className="price-line">
            ¥18<span>/月</span>
          </p>
          <ul>
            {VIP.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {!isMember ? (
            <button
              type="button"
              className="btn primary block"
              onClick={() => {
                setMember(true)
                showToast('开通成功，积分加倍已开启')
              }}
            >
              立即开通（模拟）
            </button>
          ) : (
            <button type="button" className="btn ghost block" onClick={() => setMember(false)}>
              取消会员（演示）
            </button>
          )}
        </div>
      </div>

      <button type="button" className="btn ghost block" onClick={() => nav(-1)}>
        返回
      </button>
    </div>
  )
}
