'use client'

import Link from 'next/link'
import { Bell, Search, HelpCircle, Settings, Plane, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/useAuth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const notifications = [
  { id: 1, title: 'Critical defect detected', desc: 'N737AA – Engine pylon crack confirmed', time: '2 min ago', type: 'critical' },
  { id: 2, title: 'Processing complete', desc: 'Mission M2 – F-GKXA ready for review', time: '18 min ago', type: 'success' },
  { id: 3, title: 'Mission started', desc: 'UAV-002 departed for G-VIIA inspection', time: '1 hr ago', type: 'info' },
]

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-white shrink-0">
      {/* Logo area — exactly 220px wide, matching sidebar */}
      <div className="flex h-full w-[220px] shrink-0 items-center gap-2.5 border-r border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
          <Plane className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <div className="text-[13px] font-bold text-foreground leading-tight">Aerosepct</div>
          <div className="text-[10px] text-muted-foreground">Jiair Falcon Inspection Suite</div>
        </div>
      </div>

      {/* Center action buttons */}
      <div className="flex flex-1 items-center justify-center gap-2">
        <Link href="/missions/new">
          <Button size="sm" className="h-8 px-5 text-[13px] bg-primary hover:bg-primary/90 text-white font-medium">
            New Mission
          </Button>
        </Link>
        <Link href="/upload">
          <Button variant="outline" size="sm" className="h-8 px-5 text-[13px] border-border font-medium text-foreground hover:bg-accent">
            Upload Data
          </Button>
        </Link>
      </div>

      {/* Right side icons */}
      <div className="flex items-center gap-0.5 pr-4">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground">
          <Search className="h-[15px] w-[15px]" />
          <span className="sr-only">Search</span>
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground ml-1">
          <HelpCircle className="h-[15px] w-[15px]" />
          <span className="sr-only">Help</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground ml-1">
              <Bell className="h-[15px] w-[15px]" />
              <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-red-500" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 p-3 cursor-pointer">
                <span className="text-xs font-medium text-foreground">{n.title}</span>
                <span className="text-[11px] text-muted-foreground">{n.desc}</span>
                <span className="text-[10px] text-muted-foreground/70">{n.time}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs text-center text-primary justify-center">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border text-muted-foreground hover:text-foreground ml-1">
          <Settings className="h-[15px] w-[15px]" />
          <span className="sr-only">Settings</span>
        </Button>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-3 flex items-center gap-2 rounded-md px-1 py-1 hover:bg-accent transition-colors">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white shrink-0">
                MR
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-[13px] font-semibold text-foreground leading-tight">Marcus Reinholt</div>
                <div className="text-[11px] text-muted-foreground">Operator</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">Log out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
