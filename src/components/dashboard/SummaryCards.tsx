import { formatCurrency } from '@/lib/utils'
import type { AppMode } from '@/types'
import { TrendingUp, TrendingDown, Wallet, BarChart2, ShoppingCart } from 'lucide-react'

interface Props {
  income: number
  expenses: number
  balance: number
  roi: number
  mode: AppMode
  salesCount?: number
}

export function SummaryCards({ income, expenses, balance, roi, mode, salesCount = 0 }: Props) {
  const isBusiness = mode === 'business'

  return (
    <div className={`grid gap-gutter ${isBusiness ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
      {/* Balance Card */}
      <div className={`rounded-2xl p-lg flex flex-col justify-between min-h-[140px] transition-all duration-300 relative overflow-hidden group border hover:scale-[1.02] hover:-translate-y-1 ${
        isBusiness
          ? 'bg-gradient-to-br from-[#121118] via-[#1b1a24] to-[#121118] border-outline-variant/60 hover:border-[#d4af37]/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_25px_-5px_rgba(212,175,55,0.25)]'
          : 'bg-gradient-to-br from-primary/5 via-surface-container-low to-surface border-outline-variant/60 hover:border-primary/50 shadow-sm'
      }`}>
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125 ${
          isBusiness ? 'bg-[#d4af37]/5' : 'bg-primary/10'
        }`} />
        <div className="flex justify-between items-start z-10">
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
              isBusiness ? 'text-[#d4af37]' : 'text-primary'
            }`}>
              {isBusiness ? 'Capital de Giro' : 'Saldo Disponível'}
            </span>
            <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">Saldo Geral</p>
          </div>
          <div className={`p-2 rounded-xl transition-colors ${
            isBusiness 
              ? 'bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 group-hover:bg-[#d4af37]/20'
              : 'bg-primary/10 text-primary group-hover:bg-primary/20'
          }`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 z-10">
          <p className={`text-xl md:text-2xl font-black tnum tracking-tight ${
            isBusiness 
              ? balance >= 0 ? 'text-[#f3eff7]' : 'text-error'
              : balance >= 0 ? 'text-primary' : 'text-error'
          }`}>
            {formatCurrency(balance)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full ${balance >= 0 ? 'bg-emerald-500' : 'bg-error'}`} />
            <span className="text-[10px] text-on-surface-variant/80 font-medium">Consolidado do mês</span>
          </div>
        </div>
      </div>

      {/* Income Card */}
      <div className={`rounded-2xl p-lg flex flex-col justify-between min-h-[140px] transition-all duration-300 relative overflow-hidden group border hover:scale-[1.02] hover:-translate-y-1 ${
        isBusiness
          ? 'bg-gradient-to-br from-[#121118] via-[#1b1a24] to-[#121118] border-outline-variant/60 hover:border-emerald-500/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.15)]'
          : 'bg-gradient-to-br from-emerald-500/5 via-surface-container-low to-surface border-outline-variant/60 hover:border-emerald-500/50 shadow-sm'
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125" />
        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Receitas
            </span>
            <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">Total Recebido</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 z-10">
          <p className="text-xl md:text-2xl font-black tnum tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrency(income)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-on-surface-variant/80 font-medium">Entradas brutas</span>
          </div>
        </div>
      </div>

      {/* Expenses Card */}
      <div className={`rounded-2xl p-lg flex flex-col justify-between min-h-[140px] transition-all duration-300 relative overflow-hidden group border hover:scale-[1.02] hover:-translate-y-1 ${
        isBusiness
          ? 'bg-gradient-to-br from-[#121118] via-[#1b1a24] to-[#121118] border-outline-variant/60 hover:border-rose-500/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.15)]'
          : 'bg-gradient-to-br from-rose-500/5 via-surface-container-low to-surface border-outline-variant/60 hover:border-rose-500/50 shadow-sm'
      }`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125" />
        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Despesas
            </span>
            <p className="text-body-sm text-on-surface-variant font-medium mt-0.5">Total Pago</p>
          </div>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 group-hover:bg-rose-500/20 transition-colors">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-4 z-10">
          <p className="text-xl md:text-2xl font-black tnum tracking-tight text-rose-600 dark:text-rose-400">
            {formatCurrency(expenses)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span className="text-[10px] text-on-surface-variant/80 font-medium">Saídas registradas</span>
          </div>
        </div>
      </div>

      {/* Business Vendas / ROI Card */}
      {isBusiness && (
        <div className="bg-gradient-to-br from-[#ffe07d] via-[#d4af37] to-[#aa8414] border border-[#ffe9a0]/30 rounded-2xl p-lg flex flex-col justify-between min-h-[140px] shadow-[0_10px_25px_-5px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(212,175,55,0.45)] hover:scale-[1.03] hover:-translate-y-1 active:scale-100 transition-all duration-300 relative overflow-hidden group text-black">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="absolute -right-3 -top-3 opacity-10">
            <ShoppingCart className="w-24 h-24 text-black" />
          </div>
          <div className="flex justify-between items-start z-10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-black/80">
                Vendas & Retorno
              </span>
              <p className="text-body-sm text-black/70 font-bold mt-0.5">Vendas no mês</p>
            </div>
            <div className="p-2 rounded-xl bg-black/10 text-black border border-black/10">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 z-10 flex items-end justify-between">
            <div>
              <p className="text-xl md:text-2xl font-black tnum tracking-tight text-black">
                {salesCount}
              </p>
              <div className="flex items-center gap-1 mt-1 text-black/70">
                <span className="text-[10px] font-bold tracking-tight">Produtos / Serviços</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black tnum tracking-tight text-black/80">
                ROI: {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

