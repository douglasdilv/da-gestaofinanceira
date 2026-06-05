import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { FAB } from './FAB'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <main className="flex-1 pt-16 pb-20 md:pb-0 max-w-7xl mx-auto w-full px-container-margin">
        <Outlet />
      </main>
      <BottomNav />
      <FAB />
    </div>
  )
}
