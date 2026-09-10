import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppPersisted,
  CheckInRecord,
  MealSlot,
  OnboardingProfile,
} from '../types'
import { EXERCISES } from '../data/exercises'
import {
  addDaysISO,
  DEFAULT_RATIOS,
  todayISO,
} from '../data/meals'
import { rollDay, regenerate, confirmMealState, swapMealState } from './mealState'
import type { WeekDayPlan } from '../types'

const STORAGE_KEY = 'gongwei-xingdong-v1'

const DEFAULT_STATE: AppPersisted = {
  onboarded: false,
  profile: null,
  isMember: false,
  points: 0,
  checkIns: [],
  todayMeals: null,
  mealHistory: [],
  completedExercises: {},
  weeklyCheckInTarget: 7,
}

function load(): AppPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_STATE }
  }
}

type ToastFn = (msg: string, points?: number) => void

interface AppContextValue extends AppPersisted {
  toast: string | null
  toastPoints: number | null
  showToast: ToastFn
  clearToast: () => void
  completeOnboarding: (p: OnboardingProfile) => void
  resetOnboarding: () => void
  setMember: (v: boolean) => void
  addPoints: (n: number, reason: string) => void
  regenerateMeals: (budget: number, ratios?: Record<MealSlot, number>) => void
  swapMeal: (slot: MealSlot) => void
  updateProfile: (profile: OnboardingProfile) => void
  confirmMeal: (slot: MealSlot) => void
  completeExercise: (exerciseId: string) => void
  submitCheckIn: (record: Omit<CheckInRecord, 'date'>) => void
  weekPlans: WeekDayPlan[]
  weekCheckInCount: number
  todayCompletedExercises: string[]
  ensureTodayMeals: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

const DIET_FOCUS = [
  '清淡易消化',
  '优质蛋白',
  '控油少炸',
  '蔬果补充',
  '碳水均衡',
  '轻食日',
  '暖胃汤品',
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppPersisted>(() => rollDay(load()))
  const [date, setDate] = useState(todayISO)
  const [toast, setToast] = useState<string | null>(null)
  const [toastPoints, setToastPoints] = useState<number | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const refresh = () => { setDate(todayISO()); setState(s => rollDay(s)) }
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) { setState(rollDay(load())); setDate(todayISO()) }
    }
    const timer = window.setInterval(refresh, 1000)
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', sync)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('storage', sync) }
  }, [])

  const showToast: ToastFn = useCallback((msg, points) => {
    setToast(msg)
    setToastPoints(points ?? null)
    window.setTimeout(() => {
      setToast(null)
      setToastPoints(null)
    }, 2200)
  }, [])

  const clearToast = useCallback(() => {
    setToast(null)
    setToastPoints(null)
  }, [])

  const completeOnboarding = useCallback((p: OnboardingProfile) => {
    setState((s) => rollDay({ ...s, onboarded: true, profile: p }))
  }, [])

  const resetOnboarding = useCallback(() => {
    setState({ ...DEFAULT_STATE })
  }, [])

  const setMember = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isMember: v }))
  }, [])

  const award = useCallback(
    (n: number, reason: string) => {
      setState((s) => {
        const mult = s.isMember ? 2 : 1
        const gained = n * mult
        queueMicrotask(() => showToast(reason, gained))
        return { ...s, points: s.points + gained }
      })
    },
    [showToast],
  )

  const updateProfile = useCallback((profile: OnboardingProfile) => {
    setState(s => regenerate({ ...s, profile }, profile.dailyBudget, s.todayMeals?.rules?.ratios ?? DEFAULT_RATIOS))
    showToast('档案已保存，未确认餐次已按新规则更新；历史记录保留')
  }, [showToast])

  const regenerateMeals = useCallback((budget: number, ratios = DEFAULT_RATIOS) => {
    setState(s => regenerate(s, budget, ratios))
  }, [])

  const swapMeal = useCallback((slot: MealSlot) => {
    setState(s => {
      const next = swapMealState(s, slot)
      queueMicrotask(() => showToast(next.todayMeals === s.todayMeals ? '当前约束下没有其他可选菜品；可调整档案' : '已更换未确认餐次'))
      return next
    })
  }, [showToast])

  const ensureTodayMeals = useCallback(() => { setState(s => rollDay(s)) }, [])

  const confirmMeal = useCallback((slot: MealSlot) => {
    setState(s => {
      const next = confirmMealState(s, slot)
      if (next.points > s.points) queueMicrotask(() => showToast('已记录用餐（未记录实际支付）', next.points - s.points))
      return next
    })
  }, [showToast])

  const completeExercise = useCallback(
    (exerciseId: string) => {
      if (!EXERCISES.some(ex => ex.id === exerciseId)) return
      const today = todayISO()
      setState((s) => {
        const list = s.completedExercises[today] ?? []
        if (list.includes(exerciseId)) return s
        const mult = s.isMember ? 2 : 1
        const gained = 15 * mult
        queueMicrotask(() => showToast('完成运动', gained))
        return {
          ...s,
          points: s.points + gained,
          completedExercises: {
            ...s.completedExercises,
            [today]: [...list, exerciseId],
          },
        }
      })
    },
    [showToast],
  )

  const submitCheckIn = useCallback(
    (record: Omit<CheckInRecord, 'date'>) => {
      const today = todayISO()
      setState((s) => {
        const exists = s.checkIns.some((c) => c.date === today)
        if (exists) {
          queueMicrotask(() => showToast('今日已打卡'))
          return s
        }
        const mult = s.isMember ? 2 : 1
        const gained = 20 * mult
        queueMicrotask(() => showToast('打卡成功', gained))
        return {
          ...s,
          points: s.points + gained,
          checkIns: [...s.checkIns, { ...record, moved: (s.completedExercises[today]?.length ?? 0) > 0 || record.moved, date: today }],
        }
      })
    },
    [showToast],
  )

  const weekPlans = useMemo(() => {
    const today = date
    const labels = ['日', '一', '二', '三', '四', '五', '六']
    // rolling 7 days starting today
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDaysISO(today, i)
      const d = new Date(date + 'T12:00:00')
      const dayLabel = i === 0 ? '今天' : `周${labels[d.getDay()]}`
      const exerciseIds = [
        EXERCISES[i % EXERCISES.length].id,
        EXERCISES[(i + 3) % EXERCISES.length].id,
      ]
      return {
        date,
        dayLabel,
        dietFocus: DIET_FOCUS[i % DIET_FOCUS.length],
        exerciseIds,
        isToday: i === 0,
      } satisfies WeekDayPlan
    })
  }, [date])

  const weekCheckInCount = useMemo(() => {
    const today = date
    const start = addDaysISO(today, -6)
    return state.checkIns.filter((c) => c.date >= start && c.date <= today).length
  }, [state.checkIns, date])

  const todayCompletedExercises = state.completedExercises[todayISO()] ?? []

  const value: AppContextValue = {
    ...state,
    toast,
    toastPoints,
    showToast,
    clearToast,
    completeOnboarding,
    resetOnboarding,
    setMember,
    addPoints: award,
    regenerateMeals,
    swapMeal,
    updateProfile,
    confirmMeal,
    completeExercise,
    submitCheckIn,
    weekPlans,
    weekCheckInCount,
    todayCompletedExercises,
    ensureTodayMeals,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
