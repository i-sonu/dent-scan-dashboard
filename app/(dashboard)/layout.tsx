import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Topbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
