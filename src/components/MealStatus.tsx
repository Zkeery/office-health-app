import { Link } from 'react-router-dom'
import { planIssues, planTotal, SLOTS } from '../data/meals'
import { useApp } from '../store/AppContext'

export function MealStatus() {
  const { todayMeals, profile } = useApp()
  const issues = planIssues(todayMeals, profile?.dailyBudget ?? 60, profile?.dietaryNotes ?? '')
  return <div className="summary-box meal-summary" aria-live="polite">
    <div className="meal-stats"><div><span>餐单预计</span><strong>¥{planTotal(todayMeals)}</strong></div><div><span>每日预算</span><strong>¥{profile?.dailyBudget ?? 60}</strong></div><div><span>用餐记录</span><strong>{SLOTS.filter(s => todayMeals?.confirmed[s]).length}<small> / 3 餐</small></strong></div></div>
    <p className="hint">模拟附近餐厅与参考价格；未接入真实商家或订餐，不代表实际支付金额。</p>
    {issues.map(issue => <p className="err" key={issue}>{issue}</p>)}
    {issues.length > 0 && <p><Link className="link" to="/me">编辑预算与饮食档案 →</Link> · <Link className="link" to="/meals">重新出餐 →</Link></p>}
  </div>
}
