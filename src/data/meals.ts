import type { DayMealPlan, MealItem, MealSlot } from '../types'

export const MEAL_CATALOG: MealItem[] = [
  { id: 'd1', vegetarian: false, vegan: false, name: '皮蛋瘦肉粥套餐', restaurant: '早一点粥铺', price: 12, meal: 'breakfast', spicy: false, tags: ['清淡', '快'] },
  { id: 'd2', vegetarian: false, vegan: false, name: '全麦三明治 + 豆浆', restaurant: '轻食站 LightBite', price: 18, meal: 'breakfast', spicy: false, tags: ['轻食'] },
  { id: 'd3', vegetarian: true, vegan: true, name: '葱油拌面', restaurant: '阿强面馆', price: 15, meal: 'breakfast', spicy: false, tags: ['面食'] },
  { id: 'd4', vegetarian: false, vegan: false, name: '小笼包（8只）', restaurant: '老上海点心', price: 16, meal: 'breakfast', spicy: false, tags: ['点心'] },
  { id: 'd15', vegetarian: true, vegan: false, name: '燕麦酸奶杯', restaurant: '轻食站 LightBite', price: 14, meal: 'breakfast', spicy: false, tags: ['轻食', '快'] },
  { id: 'd16', vegetarian: true, vegan: false, name: '茶叶蛋 + 豆浆油条', restaurant: '街口早餐摊', price: 10, meal: 'breakfast', spicy: false, tags: ['快', '实惠'] },
  { id: 'd5', vegetarian: false, vegan: false, name: '黄焖鸡米饭', restaurant: '杨记黄焖鸡', price: 26, meal: 'lunch', spicy: true, tags: ['下饭'] },
  { id: 'd6', vegetarian: false, vegan: false, name: '番茄牛腩面', restaurant: '面面聚到', price: 32, meal: 'lunch', spicy: false, tags: ['面食'] },
  { id: 'd7', vegetarian: false, vegan: false, name: '照烧鸡腿便当', restaurant: '日式便当屋', price: 28, meal: 'lunch', spicy: false, tags: ['便当'] },
  { id: 'd8', vegetarian: false, vegan: false, name: '麻辣香锅（小份）', restaurant: '沸腾小锅', price: 36, meal: 'lunch', spicy: true, tags: ['重口'] },
  { id: 'd9', vegetarian: false, vegan: false, name: '低脂鸡胸沙拉', restaurant: '绿叶子沙拉', price: 30, meal: 'lunch', spicy: false, tags: ['轻食'] },
  { id: 'd17', vegetarian: false, vegan: false, name: '咖喱鸡肉盖浇饭', restaurant: '南洋味道', price: 29, meal: 'lunch', spicy: false, tags: ['盖饭'] },
  { id: 'd18', vegetarian: false, vegan: false, name: '鱼香茄子盖饭', restaurant: '家常小炒', price: 22, meal: 'lunch', spicy: true, tags: ['下饭'] },
  { id: 'v1', vegetarian: true, vegan: true, name: '香菇豆腐青菜饭', restaurant: '示例素食厨房', price: 22, meal: 'lunch', spicy: false, tags: ['纯素', '示例配方'] },
  { id: 'd10', vegetarian: false, vegan: false, name: '酸菜鱼（单人）', restaurant: '渝味小馆', price: 38, meal: 'dinner', spicy: true, tags: ['川味'] },
  { id: 'd11', vegetarian: true, vegan: true, name: '蒜蓉西兰花 + 米饭', restaurant: '家常小炒', price: 24, meal: 'dinner', spicy: false, tags: ['清淡'] },
  { id: 'd12', vegetarian: false, vegan: false, name: '牛肉汉堡套餐', restaurant: '街区 Burger', price: 35, meal: 'dinner', spicy: false, tags: ['西式'] },
  { id: 'd13', vegetarian: false, vegan: false, name: '海鲜炒饭', restaurant: '阿姐炒饭', price: 28, meal: 'dinner', spicy: false, tags: ['炒饭'] },
  { id: 'd14', vegetarian: true, vegan: false, name: '番茄鸡蛋面', restaurant: '面面聚到', price: 20, meal: 'dinner', spicy: false, tags: ['面食', '清淡'] },
  { id: 'd19', vegetarian: false, vegan: false, name: '清炖排骨汤 + 青菜', restaurant: '汤鲜记', price: 32, meal: 'dinner', spicy: false, tags: ['清淡'] },
  { id: 'd20', vegetarian: false, vegan: false, name: '宫保鸡丁盖饭', restaurant: '川香小馆', price: 27, meal: 'dinner', spicy: true, tags: ['下饭'] },
]

export const MEAL_LABEL: Record<MealSlot, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
}

export const DEFAULT_RATIOS = { breakfast: 20, lunch: 40, dinner: 40 }

export const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner']
export const DIET_HELP = '支持：素食（蛋奶素）、纯素、不吃辣，可组合填写。其他备注暂不能核验，将暂停自动推荐；示例菜品不代表真实商家配方。'

export function parseDiet(note: string) {
  const clean = note.trim()
  const rest = clean.replace(/素食友好|蛋奶素|纯素|全素|素食|不吃辣|忌辣|不要辣|无辣|不辣|无特殊忌口|无忌口|无|[、，,；;\s+。]/g, '')
  return { vegetarian: /素/.test(clean), vegan: /纯素|全素/.test(clean), noSpicy: /不吃辣|忌辣|不要辣|无辣|不辣/.test(clean), unsupported: rest.length > 0 }
}

export function validBudget(budget: number) {
  return Number.isFinite(budget) && budget >= 20 && budget <= 300
}

export function fitsDiet(item: MealItem, note: string) {
  const diet = parseDiet(note)
  // Look up current recipe metadata for legacy persisted meals.
  const recipe = MEAL_CATALOG.find(m => m.id === item.id)
  return !!recipe && !diet.unsupported && !(diet.noSpicy && recipe.spicy) &&
    !(diet.vegetarian && !recipe.vegetarian) && !(diet.vegan && !recipe.vegan)
}

export function planTotal(plan: DayMealPlan | null) {
  return SLOTS.reduce((sum, slot) => sum + (plan?.[slot]?.price ?? 0), 0)
}

// Ratios are preferences; total daily budget and dietary exclusions are hard constraints.
export function generateDayMeals(totalBudget: number, ratios: Record<MealSlot, number>, note: string, date: string, previous?: DayMealPlan | null): DayMealPlan {
  const fixed = previous?.date === date ? previous : null
  const plan: DayMealPlan = { date, breakfast: null, lunch: null, dinner: null, confirmed: { ...fixed?.confirmed }, rules: { budget: totalBudget, note, ratios: { ...ratios } } }
  for (const slot of SLOTS) if (fixed?.confirmed[slot]) plan[slot] = fixed[slot]
  if (!validBudget(totalBudget) || parseDiet(note).unsupported) return plan
  const pools = SLOTS.map(slot => plan[slot] ? [plan[slot]!] : MEAL_CATALOG.filter(m => m.meal === slot && fitsDiet(m, note)))
  const options: { meals: MealItem[]; score: number }[] = []
  for (const breakfast of pools[0]) for (const lunch of pools[1]) for (const dinner of pools[2]) {
    const meals = [breakfast, lunch, dinner]
    if (meals.reduce((sum, m) => sum + m.price, 0) > totalBudget) continue
    const score = meals.reduce((sum, m, i) => sum + Math.abs(m.price - totalBudget * ratios[SLOTS[i]] / 100), 0)
    options.push({ meals, score })
  }
  options.sort((a, b) => a.score - b.score)
  const selected = options[Math.floor(Math.random() * Math.min(4, options.length))]
  if (selected) SLOTS.forEach((slot, i) => { plan[slot] = selected.meals[i] })
  return plan
}

// Confirmed meals keep their recorded price; unconfirmed slots use current catalog prices.
export function minimumMealBudget(note: string, previous?: DayMealPlan | null, date = todayISO()): number | null {
  if (parseDiet(note).unsupported) return null
  const pools = SLOTS.map(slot => previous?.date === date && previous.confirmed[slot] && previous[slot]
    ? [previous[slot]!]
    : MEAL_CATALOG.filter(m => m.meal === slot && fitsDiet(m, note)))
  return pools.some(pool => !pool.length) ? null : pools.reduce((sum, pool) => sum + Math.min(...pool.map(m => m.price)), 0)
}

export function planIssues(plan: DayMealPlan | null, budget: number, note: string): string[] {
  const issues: string[] = []
  if (!validBudget(budget)) issues.push('每日预算请输入 20–300 元。')
  if (parseDiet(note).unsupported) issues.push('备注含暂不支持核验的要求，已暂停自动推荐。请在档案中确认并调整备注，或自行选择餐食。')
  if (!plan) return issues
  if (planTotal(plan) > budget) issues.push(`当前餐单预计 ¥${planTotal(plan)}，超过预算 ¥${budget}。已确认用餐保留为记录，请调整预算后重新生成未确认餐次。`)
  const conflicts = SLOTS.filter(slot => plan[slot] && !fitsDiet(plan[slot]!, note))
  if (conflicts.length && !parseDiet(note).unsupported) issues.push(`${conflicts.map(slot => MEAL_LABEL[slot]).join('、')}与当前饮食要求不符。已确认餐次保留原记录，未确认餐次请重新生成。`)
  if (SLOTS.some(slot => !plan[slot]) && !parseDiet(note).unsupported && validBudget(budget)) {
    const minimum = minimumMealBudget(note, plan, plan.date)
    if (minimum === null) issues.push('示例菜单缺少符合要求的餐次，无法组成三餐。可自行安排，或确认后调整档案。')
    else {
      issues.push(budget < minimum
        ? `当前预算不足以匹配示例三餐：最低需要 ¥${minimum}/天，还差 ¥${minimum - budget}。可调整预算或自行安排。`
        : '当前餐单尚未完整，请点击“生成三餐”重新匹配。')
    }
  }
  return issues
}

export function swapOneMeal(plan: DayMealPlan, slot: MealSlot, budget: number, note: string): MealItem | null {
  if (plan.confirmed[slot] || !validBudget(budget)) return null
  const remaining = budget - SLOTS.filter(s => s !== slot).reduce((sum, s) => sum + (plan[s]?.price ?? 0), 0)
  const pool = MEAL_CATALOG.filter(m => m.meal === slot && m.id !== plan[slot]?.id && m.price <= remaining && fitsDiet(m, note))
  return pool[Math.floor(Math.random() * pool.length)] ?? null
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDaysISO(base: string, delta: number) {
  const d = new Date(base + 'T12:00:00')
  d.setDate(d.getDate() + delta)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
