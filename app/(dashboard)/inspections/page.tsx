'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Eye, AlertTriangle, CheckCircle2, Clock, ArrowRight, Plane } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

interface InspectionRow {
  id: string
  mission_id: string
  aircraft_id: string
  aircraft?: { registration: string; model: string; manufacturer: string }
  total_defects: number
  critical_defects: number
  completed_at: string
  operator: string | null
  status: string
  mesh_url: string | null
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending_review:  { label: 'Pending Review', color: 'border-warning/40 text-warning',           icon: Clock },
  in_review:       { label: 'In Review',       color: 'border-primary/40 text-primary',           icon: Eye },
  approved:        { label: 'Approved',         color: 'border-success/40 text-success',           icon: CheckCircle2 },
  action_required: { label: 'Action Required', color: 'border-destructive/40 text-destructive',   icon: AlertTriangle },
}

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<InspectionRow[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    apiFetch<InspectionRow[]>('inspections')
      .then(setInspections)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Inspection Results</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{inspections.length} inspections completed</p>
          </div>
        </div>

        {loading && <p className="text-[13px] text-muted-foreground">Loading inspections…</p>}
        {error   && <p className="text-[13px] text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Total Inspections', value: inspections.length,                                                 color: 'text-foreground',   bg: 'bg-secondary/40' },
                { label: 'Action Required',   value: inspections.filter(i => i.status === 'action_required').length,    color: 'text-destructive',  bg: 'bg-destructive/5' },
                { label: 'Approved',          value: inspections.filter(i => i.status === 'approved').length,           color: 'text-success',      bg: 'bg-success/5' },
                { label: 'Total Defects',     value: inspections.reduce((s, i) => s + i.total_defects, 0),             color: 'text-warning',      bg: 'bg-warning/5' },
              ].map(({ label, value, color, bg }) => (
                <Card key={label} className={cn('border-border', bg)}>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-foreground">{value}</div>
                    <div className={cn('text-xs mt-0.5', color)}>{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {inspections.length === 0 && (
              <p className="text-[13px] text-muted-foreground">No inspections yet. Complete a mission to see results here.</p>
            )}

            <div className="space-y-3">
              {inspections.map(inspection => {
                const cfg = statusConfig[inspection.status] ?? statusConfig.pending_review
                const StatusIcon = cfg.icon
                const ac = inspection.aircraft
                return (
                  <Card key={inspection.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Eye className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-semibold text-foreground">
                                {ac ? `${ac.registration} — ${ac.model}` : inspection.id.slice(0, 8)}
                              </h3>
                              <Badge variant="outline" className={cn('text-[10px]', cfg.color)}>
                                <StatusIcon className="h-2.5 w-2.5 mr-1" />
                                {cfg.label}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-muted-foreground">
                              {ac && (
                                <span className="flex items-center gap-1">
                                  <Plane className="h-2.5 w-2.5" />
                                  {ac.manufacturer} {ac.model}
                                </span>
                              )}
                              <span>Operator: {inspection.operator ?? '—'}</span>
                              <span>{new Date(inspection.completed_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex gap-3">
                            <div className="text-center">
                              <div className="text-lg font-bold text-foreground">{inspection.total_defects}</div>
                              <div className="text-[10px] text-muted-foreground">Total</div>
                            </div>
                            <div className="text-center">
                              <div className={cn('text-lg font-bold', inspection.critical_defects > 0 ? 'text-destructive' : 'text-muted-foreground')}>
                                {inspection.critical_defects}
                              </div>
                              <div className="text-[10px] text-muted-foreground">Critical</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/inspections/${inspection.id}`}>
                              <Button size="sm" variant="outline" className="gap-1.5 border-border h-8 text-xs">
                                <Eye className="h-3 w-3" /> View 3D
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
