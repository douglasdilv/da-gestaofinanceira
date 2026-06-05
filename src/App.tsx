import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AppRouter } from '@/router'
import SplashScreen from '@/pages/SplashScreen'
import { useAppStore } from '@/store/appStore'

export default function App() {
  const { loading } = useAuth()
  const { mode } = useAppStore()
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    if (mode === 'business') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return <SplashScreen />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logoapp.png" alt="D&A" className="w-16 h-16 animate-spin-slow" />
          <p className="text-body-sm text-on-surface-variant">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  )
}
