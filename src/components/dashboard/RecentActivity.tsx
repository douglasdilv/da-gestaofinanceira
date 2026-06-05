import { formatCurrency, formatDate } from '@/lib/utils'
import { Filter } from 'lucide-react'
import type { Income, Expense } from '@/types'

type TransactionItem = (Income & { type: 'income' }) | (Expense & { type: 'expense' })

interface Props { items: TransactionItem[] }

const categoryIcons: Record<string, string> = {
  'Salário': 'payments', 'Freelancer': 'work', 'Comissão': 'trending_up',
  'Venda': 'sell', 'iFood': 'restaurant', 'Alimentação': 'restaurant',
  'Transporte': 'directions_car', 'Moradia': 'home', 'Saúde': 'health_and_safety',
  'Educação': 'school', 'Lazer': 'sports_esports', 'Marketing': 'campaign',
  'Software & SaaS': 'terminal', 'Logística': 'local_shipping', 'Produto': 'inventory_2',
  'Serviço': 'build', 'Outros': 'more_horiz',
}

export function RecentActivity({ items }: Props) {
  return (
    <section className="space-y-md pb-4">
      <div className="flex justify-between items-center">
        <h3 className="text-headline-md font-headline-md text-on-surface">Atividades Recentes</h3>
        <button className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <Filter className="w-4 h-4 text-on-surface-variant" />
        </button>
      </div>

      <div className="space-y-sm">
        {items.map(item => {
          const catName = (item.category as { name: string } | null)?.name || 'Outros'
          const icon = categoryIcons[catName] || 'receipt'
          const isIncome = item.type === 'income'

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-md bg-surface-container-lowest border border-outline-variant rounded-xl hover:shadow-sm transition-all card-hover"
            >
              <div className="flex items-center gap-md">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
                  isIncome ? 'bg-tertiary-container/20 text-tertiary' : 'bg-error-container/20 text-error'
                }`}>
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </div>
                <div>
                  <p className="font-semibold text-body-lg text-on-surface leading-tight">{item.name}</p>
                  <p className="text-body-sm text-on-surface-variant">
                    {catName} · {formatDate(item.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-mono-data text-mono-data font-semibold tnum ${isIncome ? 'text-tertiary' : 'text-error'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(item.value)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
