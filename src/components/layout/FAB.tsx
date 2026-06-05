import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, TrendingUp, TrendingDown, Target } from 'lucide-react'

export function FAB() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const actions = [
    { icon: TrendingUp, label: 'Nova Receita', to: '/receitas', color: 'bg-tertiary-container text-on-tertiary-container' },
    { icon: TrendingDown, label: 'Nova Despesa', to: '/despesas', color: 'bg-error-container text-on-error-container' },
    { icon: Target, label: 'Nova Meta', to: '/metas', color: 'bg-secondary-container text-on-secondary-container' },
  ]

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end gap-3">
      {/* Sub-actions */}
      {open && (
        <div className="flex flex-col items-end gap-2">
          {actions.map(({ icon: Icon, label, to, color }) => (
            <button
              key={to}
              onClick={() => { navigate(to, { state: { openForm: true } }); setOpen(false) }}
              className={`flex items-center gap-3 ${color} px-4 py-2.5 rounded-full shadow-lg text-label-md font-label-md animate-slide-up hover:scale-105 transition-transform`}
            >
              <span>{label}</span>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  )
}
