import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface PieItem { name: string; value: number }
interface Props { data: PieItem[] }

const COLORS = ['#4f378a', '#765b00', '#ba1a1a', '#6750a4', '#63597c', '#c9a74d', '#494551', '#322f35']

export function CategoryPieChart({ data }: Props) {
  const total = data.reduce((s, d) => s + d.value, 0)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0]
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0'
      return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-lg text-body-sm">
          <p className="font-semibold text-on-surface">{item.name}</p>
          <p className="text-on-surface-variant tnum">{formatCurrency(item.value)}</p>
          <p className="text-primary font-bold">{pct}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
      <h3 className="text-headline-md font-headline-md text-on-surface mb-lg">Despesas por Categoria</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', fontFamily: 'Geist' }}
            formatter={(value) => <span className="text-on-surface-variant">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
