import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'
import { SidebarNav } from './SidebarNav'
import { FAB } from './FAB'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse">
      {/* Desktop Sidebar (Right side, as requested) */}
      <SidebarNav />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 pt-16 pb-20 md:pt-20 md:pb-6 max-w-7xl mx-auto w-full px-container-margin md:px-lg">
          <Outlet />
        </main>
        <BottomNav />
        <FAB />
      </div>
    </div>
  )
}

