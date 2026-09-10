import { useApp } from '../store/AppContext'

export function Toast() {
  const { toast, toastPoints } = useApp()
  if (!toast) return null
  return (
    <div className="toast" role="status">
      <span>{toast}</span>
      {toastPoints != null && toastPoints > 0 && (
        <span className="toast-pts">+{toastPoints} 积分</span>
      )}
    </div>
  )
}
