'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Plane,
  Box,
  FileText,
  Settings,
  LogOut,
  Plus,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'
import { Button } from '@/components/ui/button'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Missions', href: '/missions', icon: Plane },
  { label: 'Aircraft Fleet', href: '/fleet', icon: Activity },
  { label: '3D Inspection Viewer', href: '/inspections', icon: Box },
  { label: 'Reports', href: '/reports', icon: FileText },
]

const adminItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user: currentUser } = useAuth()
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden lg:flex h-full w-[220px] shrink-0 flex-col bg-sidebar border-r border-sidebar-border overflow-y-auto">
      {/* Main nav — starts right at top, no logo (logo is in topbar) */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors',
              isActive(href)
                ? 'bg-primary text-white font-semibold'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
          >
            <Icon
              className={cn('h-4 w-4 shrink-0', isActive(href) ? 'text-white' : 'text-muted-foreground')}
              strokeWidth={1.5}
            />
            <span>{label}</span>
          </Link>
        ))}

        {/* Divider before admin items */}
        <div className="my-2 border-t border-sidebar-border" />

        {adminItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors',
              isActive(href)
                ? 'bg-primary text-white font-semibold'
                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground'
            )}
          >
            <Icon
              className={cn('h-4 w-4 shrink-0', isActive(href) ? 'text-white' : 'text-muted-foreground')}
              strokeWidth={1.5}
            />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* Start New Mission CTA */}
      <div className="mx-3 mb-3 rounded-xl bg-[oklch(0.13_0.03_250)] p-4 text-white">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Plus className="h-3.5 w-3.5 text-white" />
          <span className="text-[13px] font-semibold">Start New Mission</span>
        </div>
        <p className="text-[11px] text-white/70 mb-3 leading-relaxed">
          Launch a UAV inspection scan on any aircraft in your fleet.
        </p>
        <Link href="/missions/new">
          <Button className="w-full h-8 text-[12px] bg-primary hover:bg-primary/90 text-white font-semibold rounded-md">
            Create Mission
          </Button>
        </Link>
      </div>

      {/* User + Logout */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-2">
        {currentUser && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold">
              {(currentUser.name || currentUser.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-semibold text-foreground truncate">{currentUser.name || currentUser.username}</div>
              <div className="text-[10px] text-muted-foreground truncate">{currentUser.role || 'User'}</div>
            </div>
          </div>
        )}
        <button
          onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
