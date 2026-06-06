import { useAppStore } from '@/store/appStore'
import { useAuth } from '@/hooks/useAuth'
import { useCompanies } from '@/hooks/useCompanies'
import { cn } from '@/lib/utils'
import { Building2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ModeToggle() {
  const { mode, setMode, activeCompanyId, setActiveCompanyId } = useAppStore()
  const { user } = useAuth()
  const { data: companies } = useCompanies(user?.id)
  const navigate = useNavigate()

  return (
    <div className="md:hidden flex flex-col gap-2 mb-4">
      <div className="flex bg-surface-container rounded-full p-1 border border-outline-variant">
        <button
          onClick={() => setMode('personal')}
          className={cn(
            'flex-1 py-2 rounded-full text-label-md font-label-md transition-all duration-300',
            mode === 'personal'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant'
          )}
        >
          Pessoal
        </button>
        <button
          onClick={() => setMode('business')}
          className={cn(
            'flex-1 py-2 rounded-full text-label-md font-label-md transition-all duration-300',
            mode === 'business'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant'
          )}
        >
          Empresarial
        </button>
      </div>
      
      {mode === 'business' && (
        <div className="flex items-center gap-2 bg-surface-container-lowest rounded-xl px-3 py-2 border border-outline-variant">
          <Building2 className="w-5 h-5 text-primary" />
          {companies && companies.length > 0 ? (
            <select
              value={activeCompanyId || ''}
              onChange={(e) => setActiveCompanyId(e.target.value)}
              className="bg-transparent text-body-md font-semibold text-on-surface focus:outline-none flex-1 truncate cursor-pointer appearance-none"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          ) : (
            <div className="flex-1 flex justify-between items-center text-body-sm">
              <span className="text-on-surface-variant">Nenhuma empresa</span>
              <button onClick={() => navigate('/perfil')} className="flex items-center gap-1 text-primary hover:underline">
                <Plus className="w-4 h-4" /> Criar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
