import * as XLSX from 'xlsx'
import type { AnnualSummary, AppMode } from '@/types'
import { formatCurrency, getMonthName } from './utils'

export function exportToExcel(report: AnnualSummary, mode: AppMode) {
  const wb = XLSX.utils.book_new()

  // Summary sheet
  const summaryData = [
    ['D&A Gestão Financeira'],
    [`Relatório ${mode === 'personal' ? 'Pessoal' : 'Empresarial'} — ${report.year}`],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
    [],
    ['RESUMO ANUAL'],
    ['Receita Total', formatCurrency(report.totalIncome)],
    ['Despesa Total', formatCurrency(report.totalExpenses)],
    ['Lucro Líquido', formatCurrency(report.netProfit)],
    ['ROI do Ano (%)', `${report.roi.toFixed(2)}%`],
    ['Total de Movimentações', report.totalTransactions],
    ['Melhor Mês', getMonthName(report.bestMonth)],
    ['Pior Mês', getMonthName(report.worstMonth)],
    [],
    ['DETALHAMENTO MENSAL'],
    ['Mês', 'Receitas (R$)', 'Despesas (R$)', 'Saldo (R$)', 'ROI (%)', 'Qtd. Lançamentos', 'Top Receita', 'Top Gasto'],
    ...report.months.map(m => [
      getMonthName(m.month),
      m.totalIncome.toFixed(2),
      m.totalExpenses.toFixed(2),
      m.netBalance.toFixed(2),
      m.roi.toFixed(2),
      m.incomeCount + m.expenseCount,
      m.topIncomeCategory || '-',
      m.topExpenseCategory || '-',
    ]),
  ]

  const ws = XLSX.utils.aoa_to_sheet(summaryData)
  ws['!cols'] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Resumo Anual')

  // Raw monthly data sheets
  report.months.forEach(m => {
    if (m.incomeCount + m.expenseCount === 0) return
    const monthName = getMonthName(m.month).slice(0, 31)
    const mData = [
      [`${getMonthName(m.month)} / ${report.year}`],
      ['Receitas', formatCurrency(m.totalIncome)],
      ['Despesas', formatCurrency(m.totalExpenses)],
      ['Saldo', formatCurrency(m.netBalance)],
    ]
    const mws = XLSX.utils.aoa_to_sheet(mData)
    XLSX.utils.book_append_sheet(wb, mws, monthName.substring(0, 31))
  })

  XLSX.writeFile(wb, `DA_Relatorio_${report.year}_${mode === 'personal' ? 'Pessoal' : 'Empresarial'}.xlsx`)
}
