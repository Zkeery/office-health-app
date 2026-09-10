import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './store/AppContext'
import { Layout } from './components/Layout'
import { Onboarding } from './pages/Onboarding'
import { Home } from './pages/Home'
import { WeekPlan } from './pages/WeekPlan'
import { NearbyMap } from './pages/NearbyMap'
import { Meals } from './pages/Meals'
import { Exercise } from './pages/Exercise'
import { Profile } from './pages/Profile'
import { Membership } from './pages/Membership'
import { CheckInPage } from './pages/CheckIn'

function Guard({ children }: { children: React.ReactNode }) {
  const { onboarded } = useApp()
  if (!onboarded) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function OnboardGuard({ children }: { children: React.ReactNode }) {
  const { onboarded } = useApp()
  if (onboarded) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding/review" element={<Guard><Onboarding review /></Guard>} />
      <Route
        path="/onboarding"
        element={
          <OnboardGuard>
            <Onboarding />
          </OnboardGuard>
        }
      />
      <Route
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Home />} />
        <Route path="week" element={<WeekPlan />} />
        <Route path="map" element={<NearbyMap />} />
        <Route path="meals" element={<Meals />} />
        <Route path="exercise" element={<Exercise />} />
        <Route path="me" element={<Profile />} />
        <Route path="membership" element={<Membership />} />
        <Route path="checkin" element={<CheckInPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-bg">
          <AppRoutes />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
