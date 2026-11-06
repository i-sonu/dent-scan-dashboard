'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardList, Radio, AlertTriangle, Plane, Timer,
  TrendingDown, Cpu, Cloud, Server, Wifi, Box, RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/api'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface AnalyticsSummary {
  total_inspections: number
  active_missions: number
  total_defects: number
  total_aircraft: number
}

interface AircraftRow {
  id: string
  registration: string
  model: string
  manufacturer: string
  location: string | null
  status: 'active' | 'grounded' | 'maintenance'
}

interface InspectionRow {
  id: string
  aircraft?: { registration: string; model: string }
  total_defects: number
  critical_defects: number
  completed_at: string
  status: string
}

const statusColors: Record<string, string> = {
  active: 'text-green-600', grounded: 'text-red-500', maintenance: 'text-amber-500',
}
const statusIconBg: Record<string, string> = {
  active: 'bg-green-50', grounded: 'bg-red-50', maintenance: 'bg-amber-50',
}
const statusIconColor: Record<string, string> = {
  active: 'text-green-600', grounded: 'text-red-500', maintenance: 'text-amber-600',
}
const statusLabel: Record<string, string> = {
  active: 'Available', grounded: 'Grounded', maintenance: 'Maintenance',
}
const inspectionStatusColor: Record<string, string> = {
  approved: 'text-green-600', pending_review: 'text-amber-500',
  in_review: 'text-blue-500', action_required: 'text-red-500',
}
const inspectionStatusLabel: Record<string, string> = {
  approved: 'Completed', pending_review: 'Review', in_review: 'In Review', action_required: 'Critical',
}

const missionData = [ // demo chart data
  { month: 'Aug', Completed: 7,  Aborted: 2 },
  { month: 'Sep', Completed: 11, Aborted: 1 },
  { month: 'Oct', Completed: 9,  Aborted: 3 },
  { month: 'Nov', Completed: 13, Aborted: 1 },
  { month: 'Dec', Completed: 10, Aborted: 4 },
  { month: 'Jan', Completed: 8,  Aborted: 2 },
]

const defectData = [
  { month: 'Aug', Critical: 4,  Moderate: 22 },
  { month: 'Sep', Critical: 6,  Moderate: 20 },
  { month: 'Oct', Critical: 9,  Moderate: 18 },
  { month: 'Nov', Critical: 11, Moderate: 15 },
  { month: 'Dec', Critical: 15, Moderate: 12 },
  { month: 'Jan', Critical: 19, Moderate: 9  },
]

const recentInspections = [
  { id: '#INS-4821', aircraft: 'B737-800 · N482WR', location: 'LAX', date: 'Dec 18, 2024', defects: 3,  status: 'Completed', statusColor: 'text-green-600' },
  { id: '#INS-4820', aircraft: 'A320neo · N917PL',  location: 'ORD', date: 'Dec 18, 2024', defects: 7,  status: 'Processing', statusColor: 'text-blue-500' },
  { id: '#INS-4819', aircraft: 'B787-9 · N305TK',   location: 'JFK', date: 'Dec 17, 2024', defects: 1,  status: 'Completed', statusColor: 'text-green-600' },
  { id: '#INS-4818', aircraft: 'B777-300 · N741QS', location: 'SFO', date: 'Dec 17, 2024', defects: 5,  status: 'Review',    statusColor: 'text-amber-500' },
  { id: '#INS-4817', aircraft: 'A350-900 · N628DF', location: 'ATL', date: 'Dec 16, 2024', defects: 12, status: 'Critical',  statusColor: 'text-red-500' },
]

const processingBars = [
  { pct: 62, color: '#B45309' },
  { pct: 85, color: '#2563EB' },
  { pct: 45, color: '#B45309' },
  { pct: 91, color: '#2563EB' },
  { pct: 55, color: '#B45309' },
]

const systemStatus = [
  { label: 'UAV Readiness',  value: '94%',   badge: 'Operational',   badgeColor: 'text-green-600', progress: 94,  progressColor: 'bg-green-500', sub: '15/16 UAVs online',    icon: Wifi },
  { label: 'Edge Modules',   value: '12/12', badge: 'All Connected', badgeColor: 'text-blue-500',  progress: 100, progressColor: 'bg-blue-500',  sub: 'Latency: 23ms avg',    icon: Cpu },
  { label: 'Cloud Pipeline', value: '99.8%', badge: 'Healthy',       badgeColor: 'text-green-600', progress: 99,  progressColor: 'bg-green-500', sub: 'Uptime last 30 days',  icon: Cloud },
  { label: 'Backend API',    value: '42ms',  badge: 'Nominal',       badgeColor: 'text-green-600', progress: 78,  progressColor: 'bg-green-500', sub: 'Response time p95',    icon: Server },
]

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-white p-2.5 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const [refreshing, setRefreshing]       = useState(false)
  const [summary, setSummary]             = useState<AnalyticsSummary | null>(null)
  const [fleetData, setFleetData]         = useState<AircraftRow[]>([])
  const [recentInspections, setRecent]    = useState<InspectionRow[]>([])

  const fetchAll = () => {
    setRefreshing(true)
    Promise.all([
      apiFetch<AnalyticsSummary>('analytics/summary'),
      apiFetch<AircraftRow[]>('aircraft'),
      apiFetch<InspectionRow[]>('inspections'),
    ]).then(([s, ac, ins]) => {
      setSummary(s)
      setFleetData(ac.slice(0, 5))
      setRecent(ins.slice(0, 5))
    }).catch(console.error)
      .finally(() => setRefreshing(false))
  }

  useEffect(() => { fetchAll() }, [])

  const kpis = [
    { label: 'TOTAL INSPECTIONS', value: summary?.total_inspections.toLocaleString() ?? '—', change: 'from database', changeColor: 'text-green-600', icon: ClipboardList, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'ACTIVE MISSIONS',   value: summary?.active_missions.toLocaleString() ?? '—',   change: 'in-flight or queued',  changeColor: 'text-green-600', icon: Radio,        iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'DETECTED DEFECTS',  value: summary?.total_defects.toLocaleString() ?? '—',     change: 'total logged',         changeColor: 'text-red-500',   icon: AlertTriangle, iconBg: 'bg-red-50',  iconColor: 'text-red-500' },
    { label: 'AIRCRAFT MONITORED',value: summary?.total_aircraft.toLocaleString() ?? '—',    change: 'in fleet',             changeColor: 'text-muted-foreground', icon: Plane,   iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'PROCESSING QUEUE',  value: summary?.active_missions.toLocaleString() ?? '—',   change: 'active jobs',          changeColor: 'text-amber-500', icon: Timer,        iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  ]

  const handleRefresh = () => fetchAll()

  return (
    <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-4">

      {/* Page header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">System Overview</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Real-time platform status &amp; inspection intelligence</p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[12px] text-muted-foreground">Last updated: 2 min ago</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-7 px-3 text-[12px] border-border bg-white gap-1.5 transition-all hover:border-primary/30"
          >
            <RefreshCw className={cn('h-3 w-3', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <Card
            key={kpi.label}
            className="bg-white border-border shadow-none rounded-lg animate-fade-in-up hover:shadow-md transition-shadow duration-300"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">{kpi.label}</span>
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-md shrink-0', kpi.iconBg)}>
                  <kpi.icon className={cn('h-3.5 w-3.5', kpi.iconColor)} strokeWidth={1.8} />
                </div>
              </div>
              <div className="text-[32px] font-bold text-foreground leading-none animate-count-up" style={{ animationDelay: `${i * 60 + 200}ms` }}>{kpi.value}</div>
              <div className={cn('mt-1.5 text-[12px] font-medium', kpi.changeColor)}>{kpi.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Fleet | Mission Chart | Defect Chart */}
      <div className="grid grid-cols-[280px_1fr_1fr] gap-4">

        {/* Fleet Availability */}
        <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-left delay-100">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-foreground">Fleet Availability</h2>
              <Link href="/fleet" className="text-[12px] font-medium text-primary hover:underline transition-colors">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-4 space-y-2">
            {fleetData.length === 0 && <p className="text-[12px] text-muted-foreground px-1">No aircraft yet.</p>}
            {fleetData.map((ac, i) => (
              <div
                key={ac.id}
                className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5 hover:bg-[#f5f6f8] hover:border-primary/20 transition-all duration-200 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${150 + i * 60}ms` }}
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0 transition-transform hover:scale-110', statusIconBg[ac.status] ?? 'bg-blue-50')}>
                  <Plane className={cn('h-3.5 w-3.5', statusIconColor[ac.status] ?? 'text-blue-600')} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-foreground truncate">{ac.model} · {ac.registration}</div>
                  <div className="text-[11px] text-muted-foreground">{ac.location ?? '—'}</div>
                </div>
                <span className={cn('text-[12px] font-semibold shrink-0', statusColors[ac.status] ?? 'text-muted-foreground')}>{statusLabel[ac.status] ?? ac.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mission Completion Rate */}
        <Card className="bg-white border-border shadow-none rounded-lg animate-scale-in delay-200">
          <CardHeader className="px-4 pt-4 pb-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-foreground">Mission Completion Rate</h2>
              <span className="text-[11px] text-muted-foreground">Last 6 months</span>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-3 pt-1">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={missionData} barSize={14} barGap={2} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<ChartTip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" iconSize={7} />
                <Bar dataKey="Completed" fill="#2563EB" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={800} />
                <Bar dataKey="Aborted"   fill="#B45309" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={800} animationBegin={200} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Defect Volume Over Time */}
        <Card className="bg-white border-border shadow-none rounded-lg animate-scale-in delay-300">
          <CardHeader className="px-4 pt-4 pb-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-foreground">Defect Volume Over Time</h2>
              <Link href="/inspections" className="text-[12px] font-medium text-primary hover:underline transition-colors">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="px-2 pb-3 pt-1">
            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={defectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<ChartTip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} iconType="circle" iconSize={7} />
                <Line type="monotone" dataKey="Critical" stroke="#2563EB" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1200} />
                <Line type="monotone" dataKey="Moderate" stroke="#B45309" strokeWidth={2.5} dot={false} isAnimationActive animationDuration={1200} animationBegin={300} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Recent Inspections | Processing + Quick Actions */}
      <div className="grid grid-cols-[1fr_288px] gap-4">

        {/* Recent Inspections */}
        <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-up delay-300">
          <CardHeader className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-foreground">Recent Inspections</h2>
              <Link href="/reports" className="text-[12px] font-medium text-primary hover:underline transition-colors">All Reports</Link>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            {recentInspections.length === 0 && <p className="text-[13px] text-muted-foreground py-2">No inspections yet.</p>}
            {recentInspections.length > 0 && (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Aircraft', 'Date', 'Defects', 'Status'].map((h, i) => (
                      <th key={h} className={cn('pb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider', i >= 3 ? 'text-right' : 'text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentInspections.map((row, i) => (
                    <Link key={row.id} href={`/inspections/${row.id}`} legacyBehavior>
                      <tr
                        className={cn('group transition-colors hover:bg-[#f5f6f8] cursor-pointer animate-fade-in-up',
                          i < recentInspections.length - 1 && 'border-b border-border/50')}
                        style={{ animationDelay: `${350 + i * 60}ms` }}
                      >
                        <td className="py-2.5 text-[13px] font-bold text-foreground font-mono">{row.id.slice(0, 8).toUpperCase()}</td>
                        <td className="py-2.5 text-[13px] text-muted-foreground">{row.aircraft ? `${row.aircraft.registration} · ${row.aircraft.model}` : '—'}</td>
                        <td className="py-2.5 text-[13px] text-muted-foreground">{new Date(row.completed_at).toLocaleDateString()}</td>
                        <td className="py-2.5 text-[13px] text-right text-muted-foreground">{row.total_defects}</td>
                        <td className="py-2.5 text-right">
                          <span className={cn('text-[13px] font-semibold', inspectionStatusColor[row.status] ?? 'text-muted-foreground')}>
                            {inspectionStatusLabel[row.status] ?? row.status}
                          </span>
                        </td>
                      </tr>
                    </Link>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Processing Turnaround */}
          <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-right delay-300">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-foreground">Processing Turnaround</h2>
                <button className="text-[12px] font-medium text-primary hover:underline transition-colors">Details</button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0 space-y-2">
              {processingBars.map((bar, i) => (
                <div key={i} className="h-5 rounded-sm overflow-hidden bg-[#f0f0f0]">
                  <div
                    className="h-full rounded-sm transition-all duration-700"
                    style={{
                      width: `${bar.pct}%`,
                      backgroundColor: bar.color,
                      animation: `barGrow 0.8s ease ${300 + i * 120}ms both`,
                    }}
                  />
                </div>
              ))}
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-[12px] text-muted-foreground">Avg: 4.2 min</span>
                <span className="text-[12px] font-semibold text-green-600 flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3" /> 18% faster
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Operator Quick Actions */}
          <Card className="bg-[#EEF4FF] border-blue-100 shadow-none rounded-lg animate-fade-in-right delay-400">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[13px] font-semibold text-foreground">+ Operator Quick Actions</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'New Mission Setup', href: '/missions/new', icon: Plane },
                  { label: 'Open 3D Viewer',    href: '/inspections',  icon: Box },
                ].map(({ label, href, icon: Icon }, i) => (
                  <Link key={label} href={href}>
                    <div
                      className="flex items-center gap-2.5 rounded-md bg-white px-3 py-2.5 hover:shadow-md transition-all duration-200 border border-blue-100 cursor-pointer hover:border-primary/30 hover:-translate-y-0.5 animate-fade-in-up"
                      style={{ animationDelay: `${450 + i * 80}ms` }}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 shrink-0 transition-transform hover:scale-110">
                        <Icon className="h-3 w-3 text-blue-600" strokeWidth={1.8} />
                      </div>
                      <span className="text-[13px] font-medium text-foreground">{label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Row 4: System Status */}
      <div className="grid grid-cols-4 gap-3">
        {systemStatus.map((s, i) => (
          <Card
            key={s.label}
            className="bg-white border-border shadow-none rounded-lg hover:shadow-md transition-shadow duration-300 animate-fade-in-up"
            style={{ animationDelay: `${400 + i * 70}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold text-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[26px] font-bold text-foreground leading-none">{s.value}</span>
                <span className={cn('text-[12px] font-semibold', s.badgeColor)}>{s.badge}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-1000', s.progressColor)}
                  style={{ width: `${s.progress}%`, animation: `barGrow 1s ease ${500 + i * 100}ms both` }}
                />
              </div>
              <div className="mt-1.5 text-[11px] text-muted-foreground">{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

    </main>
  )
}
