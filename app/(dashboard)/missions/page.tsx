'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Plane, Plus, Search, ChevronRight, Calendar, User, ArrowUpDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiFetch } from '@/lib/api'
import type { MissionStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MissionRow {
  id: string
  name: string
  aircraft_id: string
  aircraft?: { registration: string; model: string }
  inspection_type: string
  assigned_operator: string | null
  created_at: string
  status: MissionStatus
  progress: number
}

const statusConfig: Record<MissionStatus, { label: string; color: string; dot: string }> = {
  draft:      { label: 'Draft',      color: 'border-border text-muted-foreground',      dot: 'bg-muted-foreground' },
  preflight:  { label: 'Pre-Flight', color: 'border-primary/40 text-primary',           dot: 'bg-primary' },
  flying:     { label: 'Flying',     color: 'border-warning/40 text-warning',            dot: 'bg-warning animate-pulse' },
  uploading:  { label: 'Uploading',  color: 'border-info/40 text-info',                 dot: 'bg-info animate-pulse' },
  processing: { label: 'Processing', color: 'border-primary/40 text-primary',           dot: 'bg-primary animate-pulse' },
  completed:  { label: 'Completed',  color: 'border-success/40 text-success',           dot: 'bg-success' },
  failed:     { label: 'Failed',     color: 'border-destructive/40 text-destructive',   dot: 'bg-destructive' },
}

const inspectionTypeLabels: Record<string, string> = {
  full_body: 'Full Body', fuselage: 'Fuselage', wings: 'Wings',
  tail: 'Tail', landing_gear: 'Landing Gear', engine_nacelles: 'Engine Nacelles',
}

const allStatuses: MissionStatus[] = ['draft', 'preflight', 'flying', 'uploading', 'processing', 'completed', 'failed']

export default function MissionsPage() {
  const [missions, setMissions]       = useState<MissionRow[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [search, setSearch]           = useState('')
  const [filterStatus, setFilterStatus] = useState<MissionStatus | 'all'>('all')

  useEffect(() => {
    apiFetch<MissionRow[]>('missions')
      .then(setMissions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = missions.filter(m => {
    const q = search.toLowerCase()
    const matchSearch =
      m.name.toLowerCase().includes(q) ||
      (m.aircraft?.registration ?? '').toLowerCase().includes(q) ||
      (m.assigned_operator ?? '').toLowerCase().includes(q)
    return matchSearch && (filterStatus === 'all' || m.status === filterStatus)
  })

  const counts = allStatuses.reduce((acc, s) => {
    acc[s] = missions.filter(m => m.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Inspection Missions</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{missions.length} missions total</p>
          </div>
          <Link href="/missions/new">
            <Button size="sm" className="gap-2 w-full sm:w-auto">
              <Plus className="h-3.5 w-3.5" />
              New Mission
            </Button>
          </Link>
        </div>

        {loading && <p className="text-[13px] text-muted-foreground">Loading missions…</p>}
        {error   && <p className="text-[13px] text-red-500">{error}</p>}

        {!loading && (
          <>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus('all')}
                className={cn('px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                  filterStatus === 'all'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground')}
              >
                All ({missions.length})
              </button>
              {allStatuses.filter(s => counts[s] > 0).map(s => {
                const cfg = statusConfig[s]
                return (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={cn('px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                      filterStatus === s
                        ? 'bg-secondary text-foreground border-primary/50'
                        : 'bg-card border-border text-muted-foreground hover:text-foreground')}
                  >
                    {cfg.label} ({counts[s]})
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search missions, aircraft, operator…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs bg-secondary border-border" />
              </div>
              <Button variant="outline" size="sm" className="gap-2 h-8 border-border text-muted-foreground">
                <ArrowUpDown className="h-3.5 w-3.5" /> Sort
              </Button>
            </div>

            <Card className="bg-card border-border">
              <CardHeader className="px-5 py-3 border-b border-border">
                <div className="grid grid-cols-12 text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  <span className="col-span-4">Mission</span>
                  <span className="col-span-2 hidden md:block">Aircraft</span>
                  <span className="col-span-2 hidden lg:block">Type</span>
                  <span className="col-span-2 hidden md:block">Operator</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Plane className="h-8 w-8 mb-3 opacity-30" />
                    <p className="text-sm">No missions found</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filtered.map(m => {
                      const cfg = statusConfig[m.status]
                      const href =
                        m.status === 'flying'     ? `/monitoring/${m.id}` :
                        m.status === 'uploading'  ? `/upload/${m.id}` :
                        m.status === 'preflight'  ? `/preflight/${m.id}` :
                        `/missions/${m.id}`

                      return (
                        <Link key={m.id} href={href}>
                          <div className="grid grid-cols-12 items-center gap-2 px-5 py-3 hover:bg-secondary/40 transition-colors cursor-pointer">
                            <div className="col-span-4 flex items-center gap-3 min-w-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                <Plane className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-foreground truncate">{m.name}</div>
                                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {new Date(m.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2 hidden md:block">
                              <div className="text-xs font-medium text-foreground">{m.aircraft?.registration ?? '—'}</div>
                              <div className="text-[11px] text-muted-foreground">{m.aircraft?.model ?? ''}</div>
                            </div>
                            <div className="col-span-2 hidden lg:block">
                              <span className="text-xs text-muted-foreground">{inspectionTypeLabels[m.inspection_type] ?? m.inspection_type}</span>
                            </div>
                            <div className="col-span-2 hidden md:flex items-center gap-1.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">{(m.assigned_operator ?? '—').split(' ')[0]}</span>
                            </div>
                            <div className="col-span-8 md:col-span-2 flex items-center justify-end gap-2">
                              {m.progress > 0 && m.progress < 100 && (
                                <div className="hidden sm:flex flex-col items-end gap-1">
                                  <span className="text-[10px] text-muted-foreground">{m.progress}%</span>
                                  <div className="h-1 w-14 rounded-full bg-border overflow-hidden">
                                    <div className="h-full rounded-full bg-primary" style={{ width: `${m.progress}%` }} />
                                  </div>
                                </div>
                              )}
                              <Badge variant="outline" className={cn('text-[10px] flex items-center gap-1', cfg.color)}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
                                {cfg.label}
                              </Badge>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
