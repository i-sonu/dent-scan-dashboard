'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Battery,
  Wifi,
  Camera,
  Cpu,
  Wind,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plane,
  RefreshCw,
  Navigation,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { missions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

type CheckStatus = 'pass' | 'fail' | 'warning' | 'checking'

const initialChecks = [
  { id: 'battery', label: 'Battery Level', value: '94%', status: 'pass' as CheckStatus, icon: Battery, category: 'UAV System' },
  { id: 'gps', label: 'GPS Signal', value: '14 satellites', status: 'pass' as CheckStatus, icon: Navigation, category: 'UAV System' },
  { id: 'signal', label: 'Radio Link', value: '-62 dBm', status: 'pass' as CheckStatus, icon: Wifi, category: 'UAV System' },
  { id: 'camera', label: 'ZED Camera', value: '2K stereo active', status: 'pass' as CheckStatus, icon: Camera, category: 'Sensors' },
  { id: 'imu', label: 'IMU Calibration', value: 'Calibrated', status: 'pass' as CheckStatus, icon: Cpu, category: 'Sensors' },
  { id: 'depth', label: 'Depth Sensor', value: 'Active', status: 'pass' as CheckStatus, icon: Cpu, category: 'Sensors' },
  { id: 'wind', label: 'Wind Speed', value: '12 km/h', status: 'warning' as CheckStatus, icon: Wind, category: 'Environmental' },
  { id: 'clearance', label: 'Airspace Clearance', value: 'NOTAM filed', status: 'pass' as CheckStatus, icon: MapPin, category: 'Airspace' },
  { id: 'jetson', label: 'Jetson Edge Module', value: 'Ready', status: 'pass' as CheckStatus, icon: Cpu, category: 'Edge Compute' },
]

const statusIcon = { pass: CheckCircle2, fail: XCircle, warning: AlertCircle, checking: RefreshCw }
const statusColor = {
  pass: 'text-success',
  fail: 'text-destructive',
  warning: 'text-warning',
  checking: 'text-muted-foreground animate-spin',
}

export default function PreflightPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const mission = missions.find((m) => m.id === id) ?? missions[3]
  const [checks, setChecks] = useState(initialChecks)
  const [running, setRunning] = useState(false)
  const [launching, setLaunching] = useState(false)
  const [checksDone, setChecksDone] = useState(false)

  const passCount = checks.filter((c) => c.status === 'pass').length
  const warnCount = checks.filter((c) => c.status === 'warning').length
  const failCount = checks.filter((c) => c.status === 'fail').length

  const runChecks = async () => {
    setRunning(true)
    setChecks(checks.map((c) => ({ ...c, status: 'checking' })))
    for (let i = 0; i < checks.length; i++) {
      await new Promise((r) => setTimeout(r, 350))
      setChecks((prev) => {
        const updated = [...prev]
        updated[i] = { ...updated[i], status: initialChecks[i].status }
        return updated
      })
    }
    setRunning(false)
    setChecksDone(true)
  }

  const handleLaunch = async () => {
    setLaunching(true)
    await new Promise((r) => setTimeout(r, 1200))
    router.push(`/monitoring/${id}`)
  }

  const categories = [...new Set(checks.map((c) => c.category))]

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Pre-Flight Checklist</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{mission.aircraft.registration} — {mission.name}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={runChecks} disabled={running} className="gap-2 border-border">
              <RefreshCw className={cn('h-3.5 w-3.5', running && 'animate-spin')} />
              {running ? 'Running checks...' : 'Run System Checks'}
            </Button>
            <Button
              size="sm"
              onClick={handleLaunch}
              disabled={!checksDone || failCount > 0 || launching}
              className="gap-2"
            >
              {launching ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Launching...
                </span>
              ) : (
                <>
                  <Plane className="h-3.5 w-3.5" />
                  Launch Mission
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Passed', count: passCount, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Warnings', count: warnCount, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Failed', count: failCount, color: 'text-destructive', bg: 'bg-destructive/10' },
          ].map(({ label, count, color, bg }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-md', bg)}>
                  <span className={cn('text-lg font-bold', color)}>{count}</span>
                </div>
                <span className="text-xs text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Checks by category */}
        <div className="space-y-4">
          {categories.map((cat) => (
            <Card key={cat} className="bg-card border-border">
              <CardHeader className="px-5 py-3 border-b border-border">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {checks.filter((c) => c.category === cat).map((check) => {
                    const StatusIcon = statusIcon[check.status]
                    return (
                      <div key={check.id} className="flex items-center gap-3 px-5 py-3">
                        <check.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-foreground">{check.label}</div>
                          <div className="text-[11px] text-muted-foreground">{check.value}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn('h-4 w-4', statusColor[check.status])} />
                          <span className={cn('text-xs font-medium capitalize', statusColor[check.status])}>
                            {check.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Flight path preview */}
        <Card className="bg-card border-border">
          <CardHeader className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Auto-Generated Flight Path
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-success/30 text-success">Preview</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="relative h-48 rounded-md border border-border bg-secondary/30 overflow-hidden flex items-center justify-center">
              {/* Grid background */}
              <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>

              {/* Aircraft silhouette */}
              <svg viewBox="0 0 200 100" className="w-48 opacity-20">
                <ellipse cx="100" cy="50" rx="80" ry="15" fill="currentColor" />
                <polygon points="180,50 200,45 200,55" fill="currentColor" />
                <polygon points="20,50 0,45 0,55" fill="currentColor" />
                <rect x="85" y="10" width="30" height="30" rx="2" fill="currentColor" />
                <rect x="90" y="60" width="20" height="20" rx="2" fill="currentColor" />
              </svg>

              {/* Flight path overlay */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M 30 30 L 170 30 L 170 70 L 30 70 L 30 50 L 170 50"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.6"
                />
                <circle cx="30" cy="30" r="4" fill="var(--color-success)" />
                <circle cx="170" cy="50" r="4" fill="var(--color-warning)" />
              </svg>

              <div className="absolute bottom-2 right-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" />Start</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />End</span>
                <span className="flex items-center gap-1">
                  <svg width="12" height="4"><path d="M0 2 L12 2" stroke="var(--color-primary)" strokeWidth="1.5" strokeDasharray="4 2"/></svg>
                  Flight path
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Waypoints', value: '48' },
                { label: 'Est. Duration', value: '4.2 hrs' },
                { label: 'Coverage', value: '100%' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md bg-secondary/40 p-2">
                  <div className="text-sm font-bold text-foreground">{value}</div>
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
