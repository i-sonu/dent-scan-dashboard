'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Plane } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

interface AircraftRow {
  id: string
  registration: string
  model: string
  manufacturer: string
  year_of_manufacture: number
  total_flight_hours: number
  last_inspection_date: string | null
  next_inspection_due: string | null
  status: 'active' | 'grounded' | 'maintenance'
  location: string | null
}

const statusConfig = {
  active:      { label: 'Active',      color: 'text-[oklch(0.55_0.18_145)]', dot: 'bg-[oklch(0.55_0.18_145)]' },
  grounded:    { label: 'Grounded',    color: 'text-red-500',                dot: 'bg-red-500' },
  maintenance: { label: 'Maintenance', color: 'text-amber-500',              dot: 'bg-amber-500' },
}

export default function FleetPage() {
  const [aircraft, setAircraft] = useState<AircraftRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    apiFetch<AircraftRow[]>('aircraft')
      .then(setAircraft)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Aircraft Fleet</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage and monitor all registered aircraft</p>
        </div>

        {loading && <p className="text-[13px] text-muted-foreground">Loading fleet…</p>}
        {error   && <p className="text-[13px] text-red-500">{error}</p>}
        {!loading && !error && aircraft.length === 0 && (
          <p className="text-[13px] text-muted-foreground">No aircraft registered yet.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aircraft.map((ac) => {
            const cfg = statusConfig[ac.status] ?? statusConfig.active
            return (
              <Card key={ac.id} className="bg-white border-border shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 shrink-0">
                      <Plane className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-bold text-foreground">{ac.registration}</span>
                        <span className={cn('flex items-center gap-1.5 text-[12px] font-semibold', cfg.color)}>
                          <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-[13px] text-muted-foreground mt-0.5">{ac.manufacturer} {ac.model}</div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                        <div><span className="text-muted-foreground">Year: </span><span className="font-medium">{ac.year_of_manufacture}</span></div>
                        <div><span className="text-muted-foreground">Hours: </span><span className="font-medium">{ac.total_flight_hours.toLocaleString()}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Location: </span><span className="font-medium">{ac.location ?? '—'}</span></div>
                        <div className="col-span-2"><span className="text-muted-foreground">Next inspection: </span><span className="font-medium">{ac.next_inspection_due ?? '—'}</span></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
