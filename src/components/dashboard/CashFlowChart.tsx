import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AppMode } from '@/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface Props {
  userId: string
  mode: AppMode
  companyId: string | null
  currentDate: Date
}

export function CashFlowChart({ userId, mode, companyId, currentDate }: Props) {
  const { data } = useQuery({
    queryKey: ['cashflow-chart', userId, mode, companyId, format(currentDate, 'yyyy-MM')],
    queryFn: async () => {
      const months = Array.from({ length: 6 }, (_, i) => subMonths(currentDate, 5 - i))
      const results = await Promise.all(
        months.map(async (d) => {
          const start = format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd')
          const end = format(new Date(d.getFullYear(), d.getMonth() + 1, 0), 'yyyy-MM-dd')

          let incQuery = supabase.from('incomes').select('value').eq('user_id', userId).eq('mode', mode).gte('date', start).lte('date', end)
          let expQuery = supabase.from('expenses').select('value').eq('user_id', userId).eq('mode', mode).gte('date', start).lte('date', end)

          if (mode === 'business') {
            if (companyId) {
              incQuery = incQuery.eq('company_id', companyId)
              expQuery = expQuery.eq('company_id', companyId)
            } else {
              incQuery = incQuery.is('company_id', null)
              expQuery = expQuery.is('company_id', null)
            }
          } else {
            incQuery = incQuery.is('company_id', null)
            expQuery = expQuery.is('company_id', null)
          }

          const [inc, exp] = await Promise.all([incQuery, expQuery])

          return {
            month: format(d, 'MMM', { locale: ptBR }).toUpperCase(),
            Receitas: inc.data?.reduce((s, r) => s + r.value, 0) ?? 0,
            Despesas: exp.data?.reduce((s, r) => s + r.value, 0) ?? 0,
          }
        })
      )
      return results
    },
    enabled: !!userId,
  })

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-lg">
          <p className="text-label-md font-label-md text-on-surface-variant mb-2">{label}</p>
          {payload.map(p => (
            <div key={p.name} className="flex items-center gap-2 text-body-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-on-surface-variant">{p.name}:</span>
              <span className="font-semibold tnum text-on-surface">{formatCurrency(p.value)}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
      <h3 className="text-headline-md font-headline-md text-on-surface mb-lg">Fluxo de Caixa</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data || []} barGap={4} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#cbc4d2" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#494551', fontFamily: 'Geist' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#494551', fontFamily: 'Geist Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', fontFamily: 'Geist', paddingTop: '16px' }}
          />
          <Bar dataKey="Receitas" fill="#765b00" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="Despesas" fill="#cbc4d2" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
