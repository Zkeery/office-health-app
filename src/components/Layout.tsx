import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { HistoryNavigation } from './HistoryNavigation'
import { Toast } from './Toast'
import { PointsChip } from './PointsChip'

const TABS = [
  { to: '/', label: '今日', icon: '☀', end: true },
  { to: '/week', label: '七日', icon: '▦' },
  { to: '/meals', label: '出餐', icon: '◒' },
  { to: '/exercise', label: '运动', icon: '↗' },
  { to: '/map', label: '地图', icon: '⌖' },
  { to: '/me', label: '我的', icon: '◡' },
]

export function Layout() {
  const { pathname } = useLocation()
  if (pathname === '/map') return <div className="map-shell"><Outlet /><Toast /></div>
  return (
    <div className={`phone-shell studio-shell ${pathname === "/meals" ? "meals-shell" : ""}`}>
      <div className="phone-topbar">
        <div className="brand">
          <span className="brand-mark">工</span>
          <span className="brand-name">工位行动</span>
        </div>
        <HistoryNavigation />
        <PointsChip compact />
      </div>
      <main className="phone-main">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="主导航">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </NavLink>
        ))}
      </nav>
      <Toast />
    </div>
  )
}
