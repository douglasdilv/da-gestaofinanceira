import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const [phase, setPhase] = useState<'logo' | 'text' | 'done'>('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('text'), 600)
    return () => clearTimeout(t1)
  }, [])

  return (
    <div className="fixed inset-0 bg-[#fdf7ff] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-da-gold/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="splash-logo-enter">
          <img
            src="/logoapp.png"
            alt="D&A Gestão Financeira"
            className="w-40 h-40 object-contain drop-shadow-lg"
            onError={(e) => {
              // Fallback if logo not found
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `
                  <div class="w-40 h-40 rounded-3xl bg-primary flex items-center justify-center shadow-2xl">
                    <span class="text-5xl font-bold text-white">D&A</span>
                  </div>
                `
              }
            }}
          />
        </div>

        {/* App name */}
        <div className={`flex flex-col items-center gap-2 transition-opacity duration-700 ${phase === 'logo' ? 'opacity-0' : 'opacity-100'} splash-text-enter`}>
          <h1 className="text-3xl font-bold text-primary tracking-tight">D&A Gestão Financeira</h1>
          <p className="text-body-sm text-on-surface-variant">Controle financeiro profissional</p>
        </div>

        {/* Loading dots */}
        {phase === 'text' && (
          <div className="flex gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
