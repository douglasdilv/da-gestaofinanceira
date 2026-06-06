import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useAppStore } from '@/store/appStore'
import { formatMonthYear } from '@/lib/utils'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { addMonths, subMonths } from 'date-fns'

export function TopBar() {
  const { user } = useAuth()
  const { data: profile } = useProfile(user?.id)
  const { mode, setMode, currentDate, setCurrentDate } = useAppStore()
  const location = useLocation()

  const isDashboard = location.pathname === '/'
  const showDateNav = ['/', '/receitas', '/despesas'].includes(location.pathname)

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))

  return (
    <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant h-16">
      <div className="flex items-center justify-between h-full px-container-margin max-w-7xl mx-auto">
        {/* Left: Logo + Name */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <img
              src="/logoapp.png"
              alt="D&A"
              className="w-8 h-8 object-contain grayscale brightness-0 dark:invert"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </Link>
          <h1 className="text-base font-bold text-on-surface hidden sm:block">D&A Gestão Financeira</h1>
        </div>

        {/* Center: Mode toggle (desktop) + Date nav */}
        <div className="flex items-center gap-3">
          {/* Mode toggle - desktop */}
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
