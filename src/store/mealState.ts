import type { AppPersisted, MealSlot } from '../types'
import { DEFAULT_RATIOS, generateDayMeals, planIssues, swapOneMeal, todayISO, validBudget } from '../data/meals'

export function rollDay(state: AppPersisted, date = todayISO()): AppPersisted {
  if (!state.onboarded || state.todayMeals?.date === date) return state
  return {
    ...state,
    mealHistory: state.todayMeals ? [...(state.mealHistory ?? []), state.todayMeals] : state.mealHistory ?? [],
    todayMeals: generateDayMeals(state.profile?.dailyBudget ?? 60, DEFAULT_RATIOS, state.profile?.dietaryNotes ?? '', date),
  }
}

export function regenerate(state: AppPersisted, budget: number, ratios = DEFAULT_RATIOS, date = todayISO()): AppPersisted {
  if (!validBudget(budget)) return state
  const current = rollDay(state, date)
  return { ...current, profile: current.profile ? { ...current.profile, dailyBudget: budget } : null,
    todayMeals: generateDayMeals(budget, ratios, current.profile?.dietaryNotes ?? '', date, current.todayMeals) }
}

export function confirmMealState(state: AppPersisted, slot: MealSlot, date = todayISO()): AppPersisted {
  const current = rollDay(state, date)
  const plan = current.todayMeals
  if (!plan?.[slot] || plan.confirmed[slot] || planIssues(plan, current.profile?.dailyBudget ?? 60, current.profile?.dietaryNotes ?? '').length) return current
  return { ...current, points: current.points + 10 * (current.isMember ? 2 : 1), todayMeals: { ...plan, confirmed: { ...plan.confirmed, [slot]: true } } }
}

export function swapMealState(state: AppPersisted, slot: MealSlot, date = todayISO()): AppPersisted {
  const current = rollDay(state, date)
  if (!current.todayMeals) return current
  const next = swapOneMeal(current.todayMeals, slot, current.profile?.dailyBudget ?? 60, current.profile?.dietaryNotes ?? '')
  if (!next) return current
  return { ...current, todayMeals: { ...current.todayMeals, [slot]: next } }
}
