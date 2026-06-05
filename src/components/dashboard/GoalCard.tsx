import type { Goal } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Target } from 'lucide-react'

interface Props { goal: Goal }

export function GoalCard({ goal }: Props) {
  const progress = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-lg space-y-md card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-sm">{goal.icon || 'savings'}</span>
          </div>
          <div>
            <h4 className="font-semibold text-body-lg text-on-surface">{goal.title}</h4>
            {goal.description && (
              <p className="text-body-sm text-on-surface-variant">{goal.description}</p>
            )}
          </div>
        </div>
        <span className="text-headline-md font-headline-md text-primary">{progress.toFixed(0)}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-label-md font-label-md text-on-surface-variant">
        <span className="tnum">{formatCurrency(goal.current_amount)}</span>
        <span className="tnum">Meta: {formatCurrency(goal.target_amount)}</span>
      </div>
    </div>
  )
}
