import { useNavigate } from 'react-router-dom'
import { CheckInModal } from '../components/CheckInModal'
export function CheckInPage() {
  const nav = useNavigate()
  return <CheckInModal open onClose={() => nav('/')} />
}
