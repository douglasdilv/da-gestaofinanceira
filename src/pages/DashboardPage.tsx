import { useAuth } from '@/hooks/useAuth'
import { useIncomes } from '@/hooks/useIncomes'
import { useExpenses } from '@/hooks/useExpenses'
import { useGoals } from '@/hooks/useGoals'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, calculateROI, getMonthName } from '@/lib/utils'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { CashFlowChart } from '@/components/dashboard/CashFlowChart'
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart'
import { GoalCard } from '@/components/dashboard/GoalCard'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { Link } from 'react-router-dom'
import { useAnnualReport } from '@/hooks/useReports'

export default function DashboardPage() {
  const { user } = useAuth()
  const { mode, currentDate } = useAppStore()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const { data: incomes = [], totalIncome } = useIncomes({ userId: user?.id || '', mode, year, month })
  const { data: expenses = [], totalExpenses } = useExpenses({ userId: user?.id || '', mode, year, month })
  const { data: goals = [] } = useGoals(user?.id, mode)
  const { data: annualReport } = useAnnualReport(user?.id, year, mode)

  const netBalance = totalIncome - totalExpenses
  const roi = calculateROI(totalIncome, totalExpenses)

  // Recent transactions (mix of incomes and expenses, sorted by date)
  const recentItems = [
    ...incomes.map(i => ({ ...i, type: 'income' as const })),
    ...expenses.map(e => ({ ...e, type: 'expense' as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  // Category breakdown for pie chart
  const expenseCategoryMap: Record<string, number> = {}
  expenses.forEach(e => {
    const cat = (e.category as { name: string } | null)?.name || 'Outros'
    expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + e.value
  })
  const pieData = Object.entries(expenseCategoryMap).map(([name, value]) => ({ name, value }))

  // Smart alerts
  const alerts = []
  if (totalExpenses > totalIncome * 0.9 && totalIncome > 0) {
    alerts.push({ type: 'warning', message: 'Despesas estão próximas de 90% das receitas este mês.' })
  }
  if (netBalance < 0) {
    alerts.push({ type: 'error', message: `Saldo negativo de ${formatCurrency(Math.abs(netBalance))} este mês.` })
  }
  goals.forEach(g => {
    const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
    if (progress >= 100) {
      alerts.push({ type: 'success', message: `🎉 Meta "${g.title}" atingida!` })
    }
  })

  return (
    <div className="py-lg space-y-lg">
      {/* Mode toggle - mobile */}
      <ModeToggle />

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-body-sm ${
              a.type === 'error' ? 'bg-error-container text-on-error-container' :
              a.type === 'warning' ? 'bg-tertiary-container/40 text-on-tertiary-container' :
              'bg-primary/10 text-primary'
            }`}>
              <span className="material-symbols-outlined text-base">
                {a.type === 'error' ? 'warning' : a.type === 'warning' ? 'info' : 'check_circle'}
              </span>
              {a.message}
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards
        income={totalIncome}
        expenses={totalExpenses}
        balance={netBalance}
        roi={roi}
        mode={mode}
        annualIncome={annualReport?.totalIncome}
      />

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <CashFlowChart userId={user?.id || ''} mode={mode} currentDate={currentDate} />
        {pieData.length > 0 && <CategoryPieChart data={pieData} />}
      </div>

      {/* Goals */}
      {goals.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-headline-md font-headline-md text-on-surface">Objetivos Financeiros</h3>
            <Link to="/metas" className="text-label-md font-label-md text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-sm">
            {goals.slice(0, 3).map(goal => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentItems.length > 0 && (
        <RecentActivity items={recentItems} />
      )}

      {recentItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">receipt_long</span>
          <h3 className="text-headline-md font-headline-md text-on-surface mb-2">Nenhuma movimentação</h3>
          <p className="text-body-sm text-on-surface-variant mb-6">
            Comece adicionando suas receitas e despesas de {getMonthName(month)}.
          </p>
          <Link to="/receitas" className="bg-primary text-on-primary px-6 py-md rounded-lg text-label-md font-label-md hover:bg-primary-container transition-all">
            Adicionar primeira receita
          </Link>
        </div>
      )}
    </div>
  )
}
