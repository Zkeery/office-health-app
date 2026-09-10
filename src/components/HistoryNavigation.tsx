import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

type Entry = { path: string; key: string }
type PageHistory = { entries: Entry[]; index: number; observedKey: string; pendingPath?: string }
const STORAGE_KEY = 'gongwei-page-history-v1'
const ALLOWED_PATHS = new Set(['/', '/week', '/meals', '/exercise', '/me', '/membership', '/checkin', '/map'])

function loadHistory(current: Entry): PageHistory {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as PageHistory | null
    if (saved && Array.isArray(saved.entries) && Number.isInteger(saved.index) &&
      saved.index >= 0 && saved.index < saved.entries.length &&
      saved.entries.every(entry => typeof entry.path === 'string' && typeof entry.key === 'string' && ALLOWED_PATHS.has(entry.path.split(/[?#]/)[0])) &&
      saved.entries[saved.index].path === current.path) {
      saved.entries[saved.index] = current
      return { entries: saved.entries, index: saved.index, observedKey: current.key }
    }
  } catch { /* Session storage is optional; navigation also works in memory. */ }
  return { entries: [current], index: 0, observedKey: current.key }
}

export function HistoryNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const path = location.pathname + location.search + location.hash
  const current = { path, key: location.key }
  const [history, setHistory] = useState(() => loadHistory(current))

  // Reconcile router changes before displaying the controls, including native Back/Forward.
  if (history.observedKey !== location.key) {
    let entries = [...history.entries]
    let index = history.index
    const existing = entries.findIndex(entry => entry.key === location.key)
    if (history.pendingPath === path || navigationType === 'REPLACE') {
      entries[index] = current
    } else if (navigationType === 'POP' && existing >= 0) {
      index = existing
    } else if (entries[index].path === path) {
      entries[index] = current
    } else {
      entries = [...entries.slice(0, index + 1), current]
      index = entries.length - 1
    }
    setHistory({ entries, index, observedKey: location.key })
  }

  useEffect(() => {
    if (history.pendingPath) return
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history)) } catch { /* In-memory fallback. */ }
  }, [history])

  const move = (delta: number) => {
    const index = history.index + delta
    const target = history.entries[index]
    if (!target) return
    setHistory({ ...history, index, pendingPath: target.path })
    // Navigate to the recorded app route directly; embedded browsers need not implement history.go.
    navigate(target.path, { replace: true })
  }
  const canBack = history.index > 0
  const canForward = history.index < history.entries.length - 1
  return <nav className="history-nav" aria-label="页面前进与后退">
    <button type="button" disabled={!canBack} onClick={() => move(-1)} aria-label="后退到上一页" title={canBack ? '返回上一个访问的页面' : '已经是第一个页面'}>
      <span aria-hidden="true">←</span> 后退
    </button>
    <button type="button" disabled={!canForward} onClick={() => move(1)} aria-label="前进到下一页" title={canForward ? '恢复后退前的页面' : '没有可前进的页面'}>
      前进 <span aria-hidden="true">→</span>
    </button>
  </nav>
}
