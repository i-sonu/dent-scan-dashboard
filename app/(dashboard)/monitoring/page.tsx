'use client'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Radio } from 'lucide-react'
import { missions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export default function MonitoringPage() {
  const activeMissions = missions.filter((m) => m.status === 'flying')

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Flight Monitoring</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Real-time UAV telemetry and mission tracking</p>
        </div>
        <div className="space-y-3">
          {activeMissions.length === 0 && (
            <Card className="bg-white border-border shadow-none">
              <CardContent className="p-8 text-center text-muted-foreground text-[13px]">No active flights at this time.</CardContent>
            </Card>
          )}
          {activeMissions.map((m) => (
            <Link key={m.id} href={`/monitoring/${m.id}`}>
              <Card className="bg-white border-border shadow-none hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 shrink-0">
                    <Radio className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-foreground">{m.name}</div>
                    <div className="text-[12px] text-muted-foreground">{m.aircraft.registration} · {m.assignedUAV ?? 'N/A'}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[13px] font-semibold text-green-600">Live</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
