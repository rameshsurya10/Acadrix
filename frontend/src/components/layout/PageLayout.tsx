import { ReactNode } from 'react'
import AppHeader from './AppHeader'
import AppBottomNav from './AppBottomNav'
import AppSidebar from './AppSidebar'

interface Props {
  children: ReactNode
  sidebar?: boolean // kept for backwards compatibility, sidebar always shows
}

export default function PageLayout({ children }: Props) {
  return (
    <div className="bg-[#f8f9fa] dark:bg-[#191c1d] text-on-surface min-h-screen">
      <AppHeader />

      <div className="flex">
        <AppSidebar />
        <main className="flex-1 min-w-0 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      <AppBottomNav />
    </div>
  )
}
