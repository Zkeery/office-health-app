import assert from 'node:assert/strict'
import { test } from 'node:test'
import ts from 'typescript'
import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
// Run production domain code without adding a test framework or changing Vite imports.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) specifier += '.ts'
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.endsWith('.ts')) return { format: 'module', shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText }
    return next(url, context)
  },
})
const { generateDayMeals, DEFAULT_RATIOS, SLOTS, planTotal, planIssues, MEAL_CATALOG, fitsDiet, minimumMealBudget } = await import('../src/data/meals.ts')
const { regenerate, rollDay, confirmMealState, swapMealState } = await import('../src/store/mealState.ts')
const { EXERCISES } = await import('../src/data/exercises.ts')
const date = '2026-09-09'
const state = (budget = 80, note = '') => ({ onboarded: true, profile: { ageBand: '29-35', sitHours: '8-10', takeoutFreq: '偶尔', dailyBudget: budget, dietaryNotes: note, completedAt: date }, points: 75, isMember: false, checkIns: [{ date: '2026-09-08', ate: true, moved: true, energy: 4 }], todayMeals: null, mealHistory: [], completedExercises: { [date]: ['e1'] }, weeklyCheckInTarget: 7 })

test('20元素食不伪造三餐，报告菜单最低价格', () => {
  const plan = generateDayMeals(20, DEFAULT_RATIOS, '素食', date)
  assert.equal(planTotal(plan), 0)
  assert(SLOTS.every(slot => plan[slot] === null))
  assert(planIssues(plan, 20, '素食').some(issue => issue.includes('¥52')))
})
test('随机生成与换餐始终满足硬约束，极端比例只作偏好', () => {
  for (const note of ['', '素食', '纯素', '素食、不吃辣']) for (const budget of [20, 52, 60, 80, 300]) for (let i = 0; i < 30; i++) {
    const ratios = i % 2 ? DEFAULT_RATIOS : { breakfast: 70, lunch: 25, dinner: 5 }
    let current = regenerate(state(budget, note), budget, ratios, date)
    if (!SLOTS.every(slot => current.todayMeals[slot])) continue
    assert(planTotal(current.todayMeals) <= budget)
    for (const slot of SLOTS) {
      assert(fitsDiet(current.todayMeals[slot], note))
      const before = current.todayMeals[slot].id
      const swapped = swapMealState(current, slot, date)
      if (swapped !== current) assert.notEqual(swapped.todayMeals[slot].id, before)
      current = swapped
      assert(planTotal(current.todayMeals) <= budget)
      assert(fitsDiet(current.todayMeals[slot], note))
    }
  }
})
test('未知忌口与非法预算暂停生成', () => {
  for (const note of ['花生过敏', '不吃牛肉', '少油', '素食、鸡蛋过敏']) {
    const p = generateDayMeals(80, DEFAULT_RATIOS, note, date)
    assert.equal(planTotal(p), 0)
    assert(planIssues(p, 80, note).some(issue => issue.includes('暂不支持')))
  }
  for (const budget of [0, -1, NaN, Infinity, 301]) assert.equal(planTotal(generateDayMeals(budget, DEFAULT_RATIOS, '', date)), 0)
})
test('旧状态冲突可见且不能确认，不静默重写已有记录', () => {
  const legacy = state(20, '素食')
  legacy.todayMeals = { date, breakfast: MEAL_CATALOG.find(m => m.id === 'd3'), lunch: MEAL_CATALOG.find(m => m.id === 'd17'), dinner: MEAL_CATALOG.find(m => m.id === 'd20'), confirmed: {} }
  assert.equal(rollDay(legacy, date), legacy)
  assert.equal(planTotal(legacy.todayMeals), 71)
  assert.equal(planIssues(legacy.todayMeals, 20, '素食').length, 2)
  assert.equal(confirmMealState(legacy, 'lunch', date).points, 75)
})
test('重生成、换餐、编辑档案不能重领确认积分，历史不丢', () => {
  let current = regenerate(state(), 80, DEFAULT_RATIOS, date)
  current = confirmMealState(current, 'lunch', date)
  assert.equal(current.points, 85)
  const recorded = current.todayMeals.lunch
  current = regenerate(current, 80, DEFAULT_RATIOS, date)
  current = swapMealState(current, 'lunch', date)
  assert.deepEqual(current.todayMeals.lunch, recorded)
  assert.equal(confirmMealState(current, 'lunch', date).points, 85)
  current = regenerate({ ...current, profile: { ...current.profile, dietaryNotes: '纯素' } }, 20, DEFAULT_RATIOS, date)
  assert.deepEqual(current.todayMeals.lunch, recorded)
  assert.equal(current.checkIns.length, 1)
  assert.deepEqual(current.completedExercises[date], ['e1'])
  assert.equal(current.points, 85)
  assert(planIssues(current.todayMeals, 20, '纯素').length > 0)
})
test('跨日归档仅一次，新餐单按档案生成且不继承确认', () => {
  let current = confirmMealState(regenerate(state(), 80, DEFAULT_RATIOS, date), 'breakfast', date)
  const yesterday = current.todayMeals
  current = rollDay(current, '2026-09-10')
  assert.deepEqual(current.mealHistory, [yesterday])
  assert.deepEqual(current.todayMeals.confirmed, {})
  assert.equal(rollDay(current, '2026-09-10').mealHistory.length, 1)
  assert.equal(current.points, 85)
})
test('每项运动指导总时长等于卡片时长，包含具体动作', () => {
  for (const ex of EXERCISES) {
    assert.equal(ex.steps.reduce((sum, step) => sum + step.seconds, 0), ex.durationMin * 60, ex.name)
    assert(ex.steps.every(step => step.seconds > 0 && step.instruction.length > 0))
  }
})

test('40元不辣餐单显示52元门槛，达到门槛可生成完整三餐', () => {
  assert.equal(minimumMealBudget('不吃辣', null, date), 52)
  const unavailable = generateDayMeals(40, DEFAULT_RATIOS, '不吃辣', date)
  assert(planIssues(unavailable, 40, '不吃辣').some(issue => issue.includes('还差 ¥12')))
  const available = generateDayMeals(52, DEFAULT_RATIOS, '不吃辣', date)
  assert(SLOTS.every(slot => available[slot] && !available[slot].spicy))
  assert.equal(planTotal(available), 52)
  assert.deepEqual(planIssues(available, 52, '不吃辣'), [])
  available.confirmed.lunch = true
  available.lunch = MEAL_CATALOG.find(m => m.id === 'd6')
  assert.equal(minimumMealBudget('不吃辣', available, date), 62)
  assert.equal(minimumMealBudget('不吃辣', available, '2026-09-10'), 52)
  assert.equal(minimumMealBudget('花生过敏', available, date), null)
})
