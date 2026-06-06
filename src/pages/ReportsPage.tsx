import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useAnnualReport } from '@/hooks/useReports'
import { useAppStore } from '@/store/appStore'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, TrendingUp, TrendingDown } from 'lucide-react'
import { exportToPDF } from '@/lib/exportPDF'
import { exportToExcel } from '@/lib/exportExcel'
import { toast } from 'sonner'

export default function ReportsPage() {
  const { user } = useAuth()
  const { mode, activeCompanyId } = useAppStore()
  const [year, setYear] = useState(new Date().getFullYear())

  const { data: report, isLoading } = useAnnualReport(user?.id, year, mode, activeCompanyId)

  const handleExportPDF = async () => {
    if (!report) return
    try {
      await exportToPDF(report, mode)
      toast.success('PDF gerado com sucesso!')
    } catch {
      toast.error('Erro ao gerar PDF')
    }
  }

  const handleExportExcel = () => {
    if (!report) return
    try {
      exportToExcel(report, mode)
      toast.success('Excel exportado!')
    } catch {
      toast.error('Erro ao exportar Excel')
    }
  }

  return (
    <div className="py-lg space-y-lg">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg-mobile font-headline-lg text-on-surface">Relatórios</h2>
          <p className="text-body-sm text-on-surface-variant">Análise financeira anual completa</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 border border-outline text-primary px-3 py-2 rounded-lg text-label-md font-label-md hover:bg-surface-container transition-all">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button onClick={handleExportExcel}
            className="flex items-center gap-2 border border-outline text-primary px-3 py-2 rounded-lg text-label-md font-label-md hover:bg-surface-container transition-all">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-full hover:bg-surface-container transition-colors border border-outline-variant">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-2xl font-bold text-primary">{year}</span>
        <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-full hover:bg-surface-container transition-colors border border-outline-variant">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : report ? (
        <>
          {/* Annual summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            {[
              { label: 'Receita Total (Atual)', value: formatCurrency(report.totalIncome), sub: report.futureIncome > 0 ? `+ ${formatCurrency(report.futureIncome)} futuras` : '', color: 'text-tertiary', bg: 'bg-tertiary/5 border-tertiary/20' },
              { label: 'Despesa Total (Atual)', value: formatCurrency(report.totalExpenses), sub: report.futureExpenses > 0 ? `+ ${formatCurrency(report.futureExpenses)} futuras` : '', color: 'text-error', bg: 'bg-error/5 border-error/20' },
              { label: 'Lucro Líquido (Atual)', value: formatCurrency(report.netProfit), sub: '', color: report.netProfit >= 0 ? 'text-primary' : 'text-error', bg: 'bg-primary/5 border-primary/20' },
              { label: 'ROI do Ano', value: `${report.roi.toFixed(1)}%`, sub: '', color: 'text-primary', bg: 'bg-primary-container text-on-primary-container' },
            ].map(c => (
              <div key={c.label} className={`${c.bg} border rounded-xl p-md flex flex-col justify-center`}>
                <p className="text-label-md text-on-surface-variant mb-1">{c.label}</p>
                <p className={`text-xl font-bold tnum ${c.color}`}>{c.value}</p>
                {c.sub && <p className="text-[10px] font-bold text-on-surface-variant mt-1">{c.sub}</p>}
              </div>
            ))}
          </div>

          {/* Best/worst month + totals */}
          <div className="grid grid-cols-2 gap-gutter">
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-tertiary" />
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant">Melhor Mês</p>
                <p className="font-bold text-on-surface">{getMonthName(report.bestMonth)}</p>
              </div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-error" />
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant">Pior Mês</p>
                <p className="font-bold text-on-surface">{getMonthName(report.worstMonth)}</p>
              </div>
            </div>
          </div>

          {/* Monthly breakdown */}
          <div>
            <h3 className="text-headline-md font-headline-md text-on-surface mb-md">Detalhamento Mensal</h3>
            <div className="space-y-sm">
              {report.months.map((m) => {
                const hasData = m.totalIncome > 0 || m.totalExpenses > 0
                return (
                  <div key={m.month} className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden transition-all ${!hasData ? 'opacity-50' : 'card-hover'}`}>
                    {/* Month header */}
                    <div className="flex items-center justify-between px-lg py-md border-b border-outline-variant/50">
                      <h4 className="font-bold text-on-surface">{getMonthName(m.month)}</h4>
                      <div className="flex items-center gap-3 text-label-md font-label-md">
                        <span className={m.netBalance >= 0 ? 'text-tertiary' : 'text-error'}>
                          {m.netBalance >= 0 ? '+' : ''}{formatCurrency(m.netBalance)}
                        </span>
                      </div>
                    </div>
                    {/* Month details */}
                    <div className="px-lg py-md grid grid-cols-2 md:grid-cols-3 gap-3 text-body-sm">
                      <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-semibold mb-0.5">Faturamento</p>
                        <p className="font-bold tnum text-tertiary">{formatCurrency(m.totalIncome)}</p>
                        <p className="text-[11px] text-on-surface-variant">{m.incomeCount} lançamentos</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-semibold mb-0.5">Gastos</p>
                        <p className="font-bold tnum text-error">{formatCurrency(m.totalExpenses)}</p>
                        <p className="text-[11px] text-on-surface-variant">{m.expenseCount} lançamentos</p>
                      </div>
                      <div>
                        <p className="text-on-surface-variant text-[11px] uppercase font-semibold mb-0.5">Saldo</p>
                        <p className={`font-bold tnum ${m.netBalance >= 0 ? 'text-primary' : 'text-error'}`}>{formatCurrency(m.netBalance)}</p>
                        <p className="text-[11px] text-on-surface-variant">ROI: {m.roi.toFixed(1)}%</p>
                      </div>
                      {m.topIncomeCategory && (
                        <div className="col-span-2 md:col-span-1">
                          <p className="text-on-surface-variant text-[11px] uppercase font-semibold mb-0.5">Top Receita</p>
                          <p className="text-[12px] text-on-surface">{m.topIncomeCategory}</p>
                        </div>
                      )}
                      {m.topExpenseCategory && (
                        <div className="col-span-2 md:col-span-2">
                          <p className="text-on-surface-variant text-[11px] uppercase font-semibold mb-0.5">Top Gasto</p>
                          <p className="text-[12px] text-on-surface">{m.topExpenseCategory}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
