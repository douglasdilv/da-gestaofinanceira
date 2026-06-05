import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AppMode, AnnualSummary, MonthlyReport } from '@/types'
import { format } from 'date-fns'
import { calculateROI, getMonthName } from '@/lib/utils'

export function useAnnualReport(userId: string | undefined, year: number, mode: AppMode) {
  return useQuery({
    queryKey: ['annual-report', userId, year, mode],
    queryFn: async (): Promise<AnnualSummary> => {
      if (!userId) throw new Error('No user')
      
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`

      const [incomesRes, expensesRes] = await Promise.all([
        supabase
          .from('incomes')
          .select('*, category:categories(name)')
          .eq('user_id', userId)
          .eq('mode', mode)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('expenses')
          .select('*, category:categories(name)')
          .eq('user_id', userId)
          .eq('mode', mode)
          .gte('date', startDate)
          .lte('date', endDate),
      ])

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

      const totalIncome = months.reduce((s, m) => s + m.totalIncome, 0)
      const totalExpenses = months.reduce((s, m) => s + m.totalExpenses, 0)
      const netProfit = totalIncome - totalExpenses
      const roi = calculateROI(totalIncome, totalExpenses)

      const bestMonth = months.reduce((best, m) => m.netBalance > best.netBalance ? m : best, months[0]).month
      const worstMonth = months.reduce((worst, m) => m.netBalance < worst.netBalance ? m : worst, months[0]).month

      return {
        year,
        totalIncome,
        totalExpenses,
        netProfit,
        roi,
        bestMonth,
        worstMonth,
        growthVsLastYear: null,
        totalTransactions: incomes.length + expenses.length,
        months,
      }
    },
    enabled: !!userId,
  })
}
