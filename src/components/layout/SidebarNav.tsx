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

export function SidebarNav() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-l border-outline-variant h-screen sticky top-0">
      <div className="p-4 flex items-center justify-center border-b border-outline-variant/50">
        <img src="/logoapp.png" alt="Logo" className="w-10 h-10 object-contain mr-2" />
        <h1 className="font-headline-sm text-on-surface font-bold">D&A Finance</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-body-md">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
