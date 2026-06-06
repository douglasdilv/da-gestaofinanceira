import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useCompanies } from '@/hooks/useCompanies'
import { useAppStore } from '@/store/appStore'
import { formatMonthYear } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar, Building2 } from 'lucide-react'
import { addMonths, subMonths } from 'date-fns'
import { useEffect } from 'react'

export function TopBar() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { data: companies } = useCompanies(user?.id)
  const { mode, setMode, currentDate, setCurrentDate, activeCompanyId, setActiveCompanyId } = useAppStore()
  const location = useLocation()

  const showDateNav = ['/', '/receitas', '/despesas'].includes(location.pathname)

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  // Auto-select first company if none selected
  useEffect(() => {
    if (mode === 'business' && !activeCompanyId && companies && companies.length > 0) {
      setActiveCompanyId(companies[0].id)
    }
  }, [mode, activeCompanyId, companies, setActiveCompanyId])

  return (
    <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant h-16">
      <div className="flex items-center justify-between h-full px-container-margin max-w-7xl mx-auto">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src="/logoapp.png"
              alt="D&A"
              className="w-8 h-8 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </Link>
          <h1 className="text-base font-bold text-primary hidden sm:block">D&A Gestão Financeira</h1>
        </div>

        {/* Center: Mode toggle (desktop) + Date nav */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex bg-surface-container rounded-full p-1 border border-outline-variant">
            <button
              onClick={() => setMode('personal')}
              className={`px-5 py-1.5 rounded-full text-label-md font-label-md transition-all duration-300 ${mode === 'personal' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant'}`}
            >
              Pessoal
            </button>
            <button
              onClick={() => setMode('business')}
              className={`px-5 py-1.5 rounded-full text-label-md font-label-md transition-all duration-300 ${mode === 'business' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-variant'}`}
            >
              Empresarial
            </button>
          </div>

          {/* Company Selector (Business Mode) */}
          {mode === 'business' && (
            <div className="flex items-center gap-1 sm:gap-2 bg-surface-container-low rounded-lg px-2 py-1.5 border border-outline-variant max-w-[120px] sm:max-w-[200px]">
              <Building2 className="w-4 h-4 text-primary shrink-0 hidden sm:block" />
              {companies && companies.length > 0 ? (
                <select
                  value={activeCompanyId || ''}
                  onChange={(e) => setActiveCompanyId(e.target.value)}
                  className="bg-transparent text-label-md font-label-md text-on-surface focus:outline-none cursor-pointer w-full truncate appearance-none pr-4"
                  style={{ background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right center / 12px` }}
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface text-on-surface">{c.name}</option>
                  ))}
                </select>
              ) : (
                <Link to="/perfil" className="text-label-md font-label-md text-primary hover:underline px-1 truncate">
                  Criar Empresa
                </Link>
              )}
            </div>
          )}

          {/* Date navigation */}
          {showDateNav && (
            <div className="flex items-center gap-1 bg-surface-container-low rounded-lg px-2 py-1 border border-outline-variant">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-surface-container-highest transition-colors">
                <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
              </button>
              <div className="flex items-center gap-1.5 px-2">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span className="text-label-md font-label-md text-on-surface capitalize">
                  {formatMonthYear(currentDate)}
                </span>
              </div>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-surface-container-highest transition-colors">
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Avatar */}
        <Link to="/perfil" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border-2 border-outline-variant hover:border-primary transition-colors">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-label-md font-bold text-on-primary-container">
                {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  )
}
