import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AppMode, AnnualSummary, MonthlyReport } from '@/types'
import { format } from 'date-fns'
import { calculateROI, getMonthName } from '@/lib/utils'

export function useAnnualReport(userId: string | undefined, year: number, mode: AppMode, companyId?: string | null) {
  return useQuery({
    queryKey: ['annual-report', userId, year, mode, companyId],
    queryFn: async (): Promise<AnnualSummary> => {
      if (!userId) throw new Error('No user')
      
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      let incQuery = supabase
        .from('incomes')
        .select('*, category:categories(name)')
        .eq('user_id', userId)
        .eq('mode', mode)
        .gte('date', startDate)
        .lte('date', endDate)

      let expQuery = supabase
        .from('expenses')
        .select('*, category:categories(name)')
        .eq('user_id', userId)
        .eq('mode', mode)
        .gte('date', startDate)
        .lte('date', endDate)

      if (mode === 'business') {
        if (companyId) {
          incQuery = incQuery.eq('company_id', companyId)
          expQuery = expQuery.eq('company_id', companyId)
        } else {
          incQuery = incQuery.is('company_id', null)
          expQuery = expQuery.is('company_id', null)
        }
      }

      const [incomesRes, expensesRes] = await Promise.all([incQuery, expQuery])

      if (incomesRes.error) throw incomesRes.error
      if (expensesRes.error) throw expensesRes.error

      const incomes = incomesRes.data || []
      const expenses = expensesRes.data || []

      const months: MonthlyReport[] = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1
        const monthStr = format(new Date(year, i, 1), 'yyyy-MM')
        
        const monthIncomes = incomes.filter(inc => inc.date.startsWith(monthStr))
        const monthExpenses = expenses.filter(exp => exp.date.startsWith(monthStr))
        
        const totalIncome = monthIncomes.reduce((s, i) => s + i.value, 0)
        const totalExpenses = monthExpenses.reduce((s, e) => s + e.value, 0)

        // Top categories
        const incCatMap: Record<string, number> = {}
        monthIncomes.forEach(i => {
          const cat = (i.category as { name: string } | null)?.name || 'Outros'
          incCatMap[cat] = (incCatMap[cat] || 0) + i.value
        })
        const expCatMap: Record<string, number> = {}
        monthExpenses.forEach(e => {
          const cat = (e.category as { name: string } | null)?.name || 'Outros'
          expCatMap[cat] = (expCatMap[cat] || 0) + e.value
        })

        const topIncomeCategory = Object.entries(incCatMap).sort((a, b) => b[1] - a[1])[0]
        const topExpenseCategory = Object.entries(expCatMap).sort((a, b) => b[1] - a[1])[0]

        return {
          month,
          year,
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          topIncomeCategory: topIncomeCategory ? `${topIncomeCategory[0]} → R$ ${topIncomeCategory[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null,
          topExpenseCategory: topExpenseCategory ? `${topExpenseCategory[0]} → R$ ${topExpenseCategory[1].toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null,
          incomeCount: monthIncomes.length,
          expenseCount: monthExpenses.length,
          roi: calculateROI(totalIncome, totalExpenses),
        }
      })

      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      
      const isPastYear = year < currentYear
      const isCurrentYear = year === currentYear

      let totalIncome = 0
      let totalExpenses = 0
      let futureIncome = 0
      let futureExpenses = 0

      months.forEach(m => {
        if (isPastYear || (isCurrentYear && m.month <= currentMonth)) {
          totalIncome += m.totalIncome
          totalExpenses += m.totalExpenses
        } else if (isCurrentYear && m.month > currentMonth) {
          futureIncome += m.totalIncome
          futureExpenses += m.totalExpenses
        } else {
          // Future years
          futureIncome += m.totalIncome
          futureExpenses += m.totalExpenses
        }
      })

      const netProfit = totalIncome - totalExpenses
      const roi = calculateROI(totalIncome, totalExpenses)

      const bestMonth = months.reduce((best, m) => m.netBalance > best.netBalance ? m : best, months[0]).month
      const worstMonth = months.reduce((worst, m) => m.netBalance < worst.netBalance ? m : worst, months[0]).month

      return {
        year,
        totalIncome,
        totalExpenses,
        futureExpenses,
        futureIncome,
        netProfit,
        roi,
        bestMonth,
        worstMonth,
        growthVsLastYear: null,
        totalTransactions: incomes.length + expenses.length,
        months,
      }
    },
    enabled: !!userId && (mode === 'personal' || (mode === 'business' && companyId !== undefined)),
  })
}
