import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

export function ModeToggle() {
  const { mode, setMode } = useAppStore()

  return (
    <div className="md:hidden flex bg-surface-container rounded-full p-1 border border-outline-variant">
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
  )
}
