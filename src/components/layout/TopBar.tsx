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
    <header className="sticky top-0 w-full z-40 bg-surface border-b border-outline-variant pt-3 pb-4 px-container-margin shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
        
        {/* Top Row: Logo in Center, Avatar on Right */}
        <div className="w-full flex items-center justify-between relative">
          <div className="w-10" /> {/* Spacer for centering */}
          
          <Link to="/" className="flex flex-col items-center gap-1">
            <img
              src="/logoapp.png"
              alt="D&A"
              className="w-10 h-10 object-contain"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <h1 className="text-[10px] font-bold text-primary uppercase tracking-wider">D&A Gestão</h1>
          </Link>

          {/* Right: Avatar */}
          <Link to="/perfil" className="flex items-center">
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

        {/* Date navigation (Above buttons as requested) */}
        {showDateNav && (
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-1.5 border border-outline-variant">
              <button onClick={prevMonth} className="p-1 rounded hover:bg-surface-container-highest transition-colors">
                <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
              </button>
              <div className="flex items-center gap-1.5 px-4">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-body-md font-bold text-on-surface capitalize">
                  {formatMonthYear(currentDate)}
                </span>
              </div>
              <button onClick={nextMonth} className="p-1 rounded hover:bg-surface-container-highest transition-colors">
                <ChevronRight className="w-4 h-4 text-on-surface-variant" />
              </button>
            </div>
          </div>
        )}

        {/* Mode toggle (Pessoal / Empresarial) */}
        <div className="w-full max-w-[320px] flex bg-surface-container rounded-full p-1 border border-outline-variant shadow-inner">
          <button
            onClick={() => setMode('personal')}
            className={`flex-1 py-2 rounded-full text-label-md font-bold transition-all duration-300 ${mode === 'personal' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            Pessoal
          </button>
          <button
            onClick={() => setMode('business')}
            className={`flex-1 py-2 rounded-full text-label-md font-bold transition-all duration-300 ${mode === 'business' ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:bg-surface-variant'}`}
          >
            Empresarial
          </button>
        </div>

        {/* Company Selector (Business Mode) */}
        {mode === 'business' && (
          <div className="w-full max-w-[320px] animate-fade-in">
            {companies && companies.length > 0 ? (
              <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-3 border-2 border-primary/20 shadow-sm">
                <Building2 className="w-5 h-5 text-primary shrink-0" />
                <select
                  value={activeCompanyId || ''}
                  onChange={(e) => setActiveCompanyId(e.target.value)}
                  className="bg-transparent text-body-md font-bold text-on-surface focus:outline-none cursor-pointer w-full appearance-none pr-6 truncate"
                  style={{ background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2349454F' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right center / 20px` }}
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id} className="bg-surface text-on-surface">{c.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <Link to="/perfil" className="flex items-center justify-center gap-2 w-full bg-primary text-on-primary rounded-xl px-4 py-3 font-bold hover:brightness-110 transition-all shadow-sm">
                <Building2 className="w-5 h-5" />
                Criar Minha Empresa
              </Link>
            )}
          </div>
        )}

      </div>
    </header>
  )
}
