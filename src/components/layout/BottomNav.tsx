import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, TrendingDown, Target, BarChart3, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Início', exact: true },
  { to: '/receitas', icon: TrendingUp, label: 'Receitas' },
  { to: '/despesas', icon: TrendingDown, label: 'Despesas' },
  { to: '/metas', icon: Target, label: 'Metas' },
  { to: '/relatorios', icon: BarChart3, label: 'Relatórios' },
  { to: '/perfil', icon: User, label: 'Perfil' },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant z-50 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-0 ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-lg transition-all ${isActive ? 'bg-primary/10' : ''}`}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
                </div>
                <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-primary' : ''}`}>
                  {label}
                </span>
                {isActive && <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
