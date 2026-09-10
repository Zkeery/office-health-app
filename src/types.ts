export type AgeBand = '22-28' | '29-35' | '36-45' | '46-55'
export type SitHours = '6-8' | '8-10' | '10+'
export type TakeoutFreq = '偶尔' | '每周3-4次' | '几乎每天'
export type MealSlot = 'breakfast' | 'lunch' | 'dinner'

export interface OnboardingProfile {
  ageBand: AgeBand
  sitHours: SitHours
  takeoutFreq: TakeoutFreq
  dailyBudget: number
  dietaryNotes: string
  completedAt: string
}

export interface MealItem {
  id: string
  name: string
  restaurant: string
  price: number
  meal: MealSlot
  vegan: boolean
  vegetarian: boolean
  spicy: boolean
  tags: string[]
}

export interface DayMealPlan {
  date: string
  breakfast: MealItem | null
  lunch: MealItem | null
  dinner: MealItem | null
  confirmed: Partial<Record<MealSlot, boolean>>
  rules?: { budget: number; note: string; ratios: Record<MealSlot, number> }
}

export interface ExerciseItem {
  id: string
  name: string
  durationMin: number
  calories: number
  steps: { seconds: number; instruction: string }[]
  description: string
  category: string
  icon: string
}

export interface CheckInRecord {
  date: string
  ate: boolean
  moved: boolean
  energy: 1 | 2 | 3 | 4 | 5
  note?: string
}

export interface WeekDayPlan {
  date: string
  dayLabel: string
  dietFocus: string
  exerciseIds: string[]
  isToday: boolean
}

export interface AppPersisted {
  onboarded: boolean
  profile: OnboardingProfile | null
  isMember: boolean
  points: number
  checkIns: CheckInRecord[]
  todayMeals: DayMealPlan | null
  mealHistory: DayMealPlan[]
  completedExercises: Record<string, string[]>
  weeklyCheckInTarget: number
}
