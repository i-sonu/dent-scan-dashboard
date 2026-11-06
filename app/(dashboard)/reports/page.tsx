'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, Eye } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { cn } from '@/lib/utils'

interface ReportRow {
  id: string
  inspection_id: string
  generated_at: string
  generated_by: string
  status: string
  summary: string | null
  recommendations: string[] | null
  signed_by: string | null
  signed_at: string | null
}

const statusColors: Record<string, string> = {
  finalized: 'text-[oklch(0.55_0.18_145)]',
  draft:     'text-amber-500',
  shared:    'text-blue-500',
}

async function downloadPdf(reportId: string) {
  const res = await fetch(`/api/backend/reports/${reportId}/pdf`, { cache: 'no-store' })
  if (!res.ok) { alert('PDF generation failed'); return }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report-${reportId.slice(0, 8)}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    apiFetch<ReportRow[]>('reports')
      .then(setReports)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Reports</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">Inspection reports and maintenance documentation</p>
          </div>
        </div>

        {loading && <p className="text-[13px] text-muted-foreground">Loading reports…</p>}
        {error   && <p className="text-[13px] text-red-500">{error}</p>}
        {!loading && !error && reports.length === 0 && (
          <p className="text-[13px] text-muted-foreground">No reports yet.</p>
        )}

        {!loading && reports.length > 0 && (
          <Card className="bg-white border-border shadow-none">
            <CardContent className="p-0">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-border">
                    {['Report', 'Inspection', 'Generated', 'Status', 'Actions'].map((h, i) => (
                      <th key={h} className={cn('px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground', i === 4 ? 'text-right' : 'text-left')}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-[oklch(0.97_0.003_240)]">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">{r.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-[11px] text-muted-foreground">By {r.generated_by}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground font-mono text-[11px]">{r.inspection_id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-muted-foreground">{new Date(r.generated_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className={cn('font-semibold capitalize', statusColors[r.status] ?? 'text-muted-foreground')}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View report">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm" className="h-7 w-7 p-0" title="Download PDF"
                            onClick={() => downloadPdf(r.id)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
