'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plane, ArrowRight, Calendar, User, MapPin, Camera, HardDrive, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

interface MissionDetail {
  id: string
  name: string
  aircraft_id: string
  aircraft?: {
    registration: string
    model: string
    manufacturer: string
    location: string | null
    total_flight_hours: number
  }
  inspection_type: string
  assigned_operator: string | null
  assigned_uav: string | null
  status: string
  progress: number
  image_count: number | null
  data_size: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:      { label: 'Draft',       color: 'border-border text-muted-foreground' },
  preflight:  { label: 'Pre-Flight',  color: 'border-primary/40 text-primary' },
  flying:     { label: 'Flying',      color: 'border-warning/40 text-warning' },
  uploading:  { label: 'Uploading',   color: 'border-info/40 text-info' },
  processing: { label: 'Processing',  color: 'border-primary/40 text-primary' },
  completed:  { label: 'Completed',   color: 'border-success/40 text-success' },
  failed:     { label: 'Failed',      color: 'border-destructive/40 text-destructive' },
}

export default function MissionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [mission, setMission] = useState<MissionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch<MissionDetail>(`missions/${id}`)
      .then(setMission)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex-1 p-5 text-[13px] text-muted-foreground">Loading…</div>
  if (error)   return <div className="flex-1 p-5 text-[13px] text-red-500">{error}</div>
  if (!mission) return null

  const cfg = statusConfig[mission.status] ?? statusConfig.draft

  const nextHref =
    mission.status === 'draft'      ? `/preflight/${mission.id}` :
    mission.status === 'preflight'  ? `/preflight/${mission.id}` :
    mission.status === 'flying'     ? `/monitoring/${mission.id}` :
    mission.status === 'uploading'  ? `/upload/${mission.id}` :
    `/missions/${mission.id}`

  const nextLabel =
    mission.status === 'draft' || mission.status === 'preflight' ? 'Go to Pre-Flight' :
    mission.status === 'flying'    ? 'View Live Monitoring' :
    mission.status === 'uploading' ? 'View Upload Progress' :
    'View Mission'

  const ac = mission.aircraft

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">{mission.name}</h2>
              <Badge variant="outline" className={cn('text-xs', cfg.color)}>{cfg.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Mission ID: {mission.id.toUpperCase()}</p>
          </div>
          <Link href={nextHref}>
            <Button size="sm" className="gap-2 w-full sm:w-auto">
              {nextLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader className="px-5 py-3 border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aircraft Details</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {ac ? [
                { label: 'Registration', value: ac.registration,                                     icon: Plane },
                { label: 'Model',        value: `${ac.manufacturer} ${ac.model}`,                   icon: Plane },
                { label: 'Location',     value: ac.location ?? '—',                                 icon: MapPin },
                { label: 'Flight Hours', value: ac.total_flight_hours.toLocaleString() + ' hrs',    icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                  <span className="text-xs font-medium text-foreground">{value}</span>
                </div>
              )) : <p className="text-xs text-muted-foreground">Aircraft data unavailable</p>}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="px-5 py-3 border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mission Details</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {[
                { label: 'Operator', value: mission.assigned_operator ?? '—', icon: User },
                { label: 'UAV',      value: mission.assigned_uav ?? '—',      icon: Plane },
                { label: 'Created',  value: new Date(mission.created_at).toLocaleString(), icon: Calendar },
                ...(mission.started_at   ? [{ label: 'Started',   value: new Date(mission.started_at).toLocaleString(),   icon: Clock }] : []),
                ...(mission.completed_at ? [{ label: 'Completed', value: new Date(mission.completed_at).toLocaleString(), icon: Clock }] : []),
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
                  <span className="text-xs font-medium text-foreground">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {mission.image_count && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Images Captured', value: mission.image_count.toLocaleString(), icon: Camera },
              { label: 'Data Size',       value: mission.data_size ?? '—',             icon: HardDrive },
              { label: 'Progress',        value: `${mission.progress}%`,               icon: Clock },
            ].map(({ label, value, icon: Icon }) => (
              <Card key={label} className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className="h-4 w-4 text-primary" />
                  <div>
                    <div className="text-[11px] text-muted-foreground">{label}</div>
                    <div className="text-lg font-bold text-foreground">{value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
