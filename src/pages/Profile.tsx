import { StudioHeader } from '../components/StudioHeader'
import { useState } from 'react'
import { ProfileEditor } from '../components/ProfileEditor'
import { Link } from 'react-router-dom'
import { useApp } from '../store/AppContext'
import { ProgressBar } from '../components/ProgressBar'
import { todayISO } from '../data/meals'

export function Profile() {
  const {
    profile,
    points,
    isMember,
    weekCheckInCount,
    weeklyCheckInTarget,
    todayCompletedExercises,
    checkIns,
    resetOnboarding,
  } = useApp()

  const [editing, setEditing] = useState(false)
  const checkedToday = checkIns.some((c) => c.date === todayISO())

  return (
    <div className="page studio-page profile-page">
      <StudioHeader eyebrow={"MY SPACE · 个人中心"} title="每一点进步，都算数。" description={"在这里，看看你的积累，调整适合自己的生活节奏。"} symbol="◡" />

      <section className="card profile-hero">
        <div className="avatar">工</div>
        <div className="grow">
          <h2>工位行动用户</h2>
          <p className="muted sm">
            {profile?.ageBand} · 久坐 {profile?.sitHours}h · {profile?.takeoutFreq}
          </p>
          <p className="muted sm">预算 ¥{profile?.dailyBudget}/天</p>
        </div>
        {isMember ? <span className="pill brand">会员</span> : <span className="pill">免费</span>}
      </section>

      <section className="card">
        <div className="row between">
          <div>
            <p className="eyebrow">积分</p>
            <p className="points-xl">{points}</p>
          </div>
          <Link to="/membership" className="btn primary sm">
            {isMember ? '会员权益' : '开通会员'}
          </Link>
        </div>
        <ProgressBar
          value={weekCheckInCount}
          max={weeklyCheckInTarget}
          label={`本周打卡 ${weekCheckInCount}/${weeklyCheckInTarget}`}
        />
        <p className="hint">今日运动完成 {todayCompletedExercises.length} 项 · 打卡 {checkedToday ? '已完成' : '未完成'}</p>
      </section>

      {editing ? <ProfileEditor onClose={() => setEditing(false)} /> : <button className="btn primary block" onClick={() => setEditing(true)}>编辑预算与饮食档案</button>}

      <section className="card list-menu">
        <Link to="/onboarding/review" className="menu-item">
          <span>重新查看引导</span>
          <span className="chev">›</span>
        </Link>
        <Link to="/membership" className="menu-item">
          <span>会员中心</span>
          <span className="chev">›</span>
        </Link>
        <div className="menu-item static">
          <span>饮食备注</span>
          <span className="muted sm">{profile?.dietaryNotes || '无'}</span>
        </div>
        <div className="menu-item static">
          <span>累计打卡</span>
          <span className="muted sm">{checkIns.length} 天</span>
        </div>
      </section>

      <button
        type="button"
        className="btn ghost block danger"
        onClick={() => {
          if (window.confirm('将清除本地资料、积分与会员状态，并重新引导？')) {
            resetOnboarding()
            window.location.href = '/onboarding'
          }
        }}
      >
        重置引导 / 清除本地数据
      </button>
    </div>
  )
}
