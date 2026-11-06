'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  Download,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Printer,
  ChevronRight,
  Calendar,
  User,
  Plane,
  ClipboardList,
  BarChart3,
  Shield,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { reports, inspections } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import type { DefectSeverity, DefectType } from '@/lib/types'

const severityConfig: Record<DefectSeverity, { label: string; badgeCn: string; dot: string; bar: string }> = {
  critical: { label: 'Critical', badgeCn: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500', bar: 'bg-red-400' },
  high: { label: 'High', badgeCn: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400', bar: 'bg-orange-400' },
  medium: { label: 'Medium', badgeCn: 'bg-amber-50 text-amber-600 border-amber-200', dot: 'bg-amber-400', bar: 'bg-amber-400' },
  low: { label: 'Low', badgeCn: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-300', bar: 'bg-slate-300' },
}

const typeLabels: Record<DefectType, string> = {
  dent: 'Dent',
  corrosion: 'Corrosion',
  crack: 'Crack',
  delamination: 'Delamination',
  scratch: 'Scratch',
  paint_loss: 'Paint Loss',
  impact_damage: 'Impact Damage',
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const report = reports.find((r) => r.id === id) ?? reports[0]
  const inspection = report.inspection

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const criticalDefects = inspection.defects.filter((d) => d.severity === 'critical')
  const highDefects = inspection.defects.filter((d) => d.severity === 'high')
  const mediumDefects = inspection.defects.filter((d) => d.severity === 'medium')
  const lowDefects = inspection.defects.filter((d) => d.severity === 'low')

  const defectsBySeverity = [
    { label: 'Critical', count: criticalDefects.length, cfg: severityConfig.critical, items: criticalDefects },
    { label: 'High', count: highDefects.length, cfg: severityConfig.high, items: highDefects },
    { label: 'Medium', count: mediumDefects.length, cfg: severityConfig.medium, items: mediumDefects },
    { label: 'Low', count: lowDefects.length, cfg: severityConfig.low, items: lowDefects },
  ].filter((g) => g.count > 0)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-5">
        {/* Header */}
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up', mounted ? '' : 'opacity-0')}>
          <div>
            <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-1.5">
              <Link href="/reports" className="hover:text-foreground transition-colors">Reports</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{report.id.toUpperCase()}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Inspection Report</h1>
            <div className="flex items-center gap-3 mt-1.5 text-[12px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {report.generatedBy}
              </span>
              <Badge className={cn(
                'text-[11px] border',
                report.status === 'finalized'
                  ? 'bg-[oklch(0.55_0.18_145)]/10 text-[oklch(0.55_0.18_145)] border-[oklch(0.55_0.18_145)]/30'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              )}>
                {report.status === 'finalized' ? 'Finalized' : 'Draft'}
              </Badge>
            </div>
          </div>
          <div className={cn('flex items-center gap-2 animate-fade-in-right delay-100', mounted ? '' : 'opacity-0')}>
            <Button variant="outline" size="sm" className="gap-2 h-8 border-border hover:scale-105 transition-transform">
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            <Button variant="outline" size="sm" className="gap-2 h-8 border-border hover:scale-105 transition-transform">
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button size="sm" className="gap-2 h-8 hover:scale-105 transition-transform">
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Aircraft info */}
            <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-150', mounted ? '' : 'opacity-0')}>
              <CardHeader className="px-5 py-3 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Plane className="h-3.5 w-3.5" /> Aircraft Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
                  {[
                    { label: 'Registration', value: inspection.aircraft.registration },
                    { label: 'Model', value: inspection.aircraft.model },
                    { label: 'Manufacturer', value: inspection.aircraft.manufacturer },
                    { label: 'Year', value: inspection.aircraft.yearOfManufacture.toString() },
                    { label: 'Total Hours', value: `${inspection.aircraft.totalFlightHours.toLocaleString()} hrs` },
                    { label: 'Location', value: inspection.aircraft.location },
                  ].map(({ label, value }, i) => (
                    <div
                      key={label}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${200 + i * 50}ms` }}
                    >
                      <div className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</div>
                      <div className="text-[13px] font-semibold text-foreground mt-0.5">{value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Executive Summary */}
            <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-200', mounted ? '' : 'opacity-0')}>
              <CardHeader className="px-5 py-3 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ClipboardList className="h-3.5 w-3.5" /> Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-[13px] text-foreground leading-relaxed">{report.summary}</p>

                {/* Status verdict */}
                <div className={cn(
                  'mt-4 rounded-xl p-4 flex items-start gap-3 animate-scale-in delay-300',
                  inspection.status === 'action_required'
                    ? 'bg-red-50 border border-red-100'
                    : 'bg-[oklch(0.55_0.18_145)]/5 border border-[oklch(0.55_0.18_145)]/20'
                )}>
                  {inspection.status === 'action_required'
                    ? <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    : <CheckCircle2 className="h-5 w-5 text-[oklch(0.55_0.18_145)] shrink-0 mt-0.5" />
                  }
                  <div>
                    <div className={cn(
                      'text-[13px] font-semibold',
                      inspection.status === 'action_required' ? 'text-red-700' : 'text-[oklch(0.4_0.18_145)]'
                    )}>
                      {inspection.status === 'action_required' ? 'Maintenance Action Required' : 'Aircraft Cleared for Service'}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">
                      {inspection.status === 'action_required'
                        ? `${inspection.criticalDefects} critical defect${inspection.criticalDefects !== 1 ? 's' : ''} require immediate attention before return to service.`
                        : 'All detected defects are within acceptable limits. No immediate action required.'
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Defects by severity */}
            {defectsBySeverity.map(({ label, cfg, items }, gi) => (
              <Card
                key={label}
                className={cn('bg-white border-border shadow-none animate-fade-in-up', mounted ? '' : 'opacity-0')}
                style={{ animationDelay: `${250 + gi * 80}ms` }}
              >
                <CardHeader className="px-5 py-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {label} Defects
                    </CardTitle>
                    <Badge className={cn('text-[11px] border', cfg.badgeCn)}>{items.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {items.map((defect, i) => (
                      <div
                        key={defect.id}
                        className="px-5 py-4 hover:bg-[oklch(0.97_0.003_240)] transition-colors duration-150 animate-fade-in-up group"
                        style={{ animationDelay: `${300 + gi * 80 + i * 60}ms` }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.97_0.003_240)] shrink-0 text-[11px] font-bold text-muted-foreground mt-0.5">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-semibold text-foreground">{typeLabels[defect.type]}</span>
                              <span className="text-[11px] text-muted-foreground">·</span>
                              <span className="text-[12px] text-muted-foreground">{defect.location}</span>
                            </div>
                            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{defect.description}</p>
                            {(defect.area || defect.depth) && (
                              <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                                {defect.area && <span>Area: <strong className="text-foreground">{defect.area.toLocaleString()} mm²</strong></span>}
                                {defect.depth && <span>Depth: <strong className="text-foreground">{defect.depth} mm</strong></span>}
                              </div>
                            )}
                          </div>
                          <Link href={`/inspections/${inspection.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 shrink-0 border-border opacity-0 group-hover:opacity-100 transition-opacity hover:scale-105 transition-transform">
                              <Eye className="h-3 w-3" /> View 3D
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Recommendations */}
            <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-400', mounted ? '' : 'opacity-0')}>
              <CardHeader className="px-5 py-3 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-2.5">
                {report.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${420 + i * 60}ms` }}
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">{rec}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className={cn('space-y-4 animate-fade-in-right delay-200', mounted ? '' : 'opacity-0')}>
            {/* Stats */}
            <Card className="bg-white border-border shadow-none">
              <CardHeader className="px-5 py-3 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5" /> Defect Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[oklch(0.97_0.003_240)] px-4 py-3">
                  <span className="text-[13px] text-muted-foreground">Total Defects</span>
                  <span className="text-2xl font-bold text-foreground animate-count-up">{inspection.totalDefects}</span>
                </div>
                <div className="space-y-2">
                  {defectsBySeverity.map(({ label, count, cfg }, i) => (
                    <div
                      key={label}
                      className="flex items-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${250 + i * 60}ms` }}
                    >
                      <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', cfg.dot)} />
                      <span className="text-[13px] text-muted-foreground flex-1">{label}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-[oklch(0.92_0.005_240)] overflow-hidden">
                        <div
                          className={cn('h-full rounded-full transition-all duration-700', cfg.bar)}
                          style={{ width: `${(count / inspection.totalDefects) * 100}%` }}
                        />
                      </div>
                      <span className="text-[13px] font-semibold text-foreground w-5 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sign-off */}
            {report.signedBy && (
              <Card className="bg-white border-border shadow-none animate-scale-in delay-300">
                <CardHeader className="px-5 py-3 border-b border-border">
                  <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sign-off</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[oklch(0.55_0.18_145)]/10 mx-auto">
                    <CheckCircle2 className="h-6 w-6 text-[oklch(0.55_0.18_145)]" />
                  </div>
                  <div className="text-center">
                    <div className="text-[13px] font-semibold text-foreground">{report.signedBy}</div>
                    <div className="text-[11px] text-muted-foreground">Lead Inspector</div>
                  </div>
                  {report.signedAt && (
                    <div className="text-center text-[11px] text-muted-foreground">
                      Signed {new Date(report.signedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick links */}
            <Card className="bg-white border-border shadow-none animate-fade-in-up delay-400">
              <CardHeader className="px-5 py-3 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1">
                {[
                  { label: 'View 3D Inspection', href: `/inspections/${inspection.id}`, icon: Eye },
                  { label: 'Mission Details', href: `/missions/${inspection.missionId}`, icon: Plane },
                  { label: 'All Reports', href: '/reports', icon: FileText },
                ].map(({ label, href, icon: Icon }, i) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-muted-foreground hover:bg-[oklch(0.97_0.003_240)] hover:text-foreground transition-all duration-150 group animate-fade-in-up"
                    style={{ animationDelay: `${420 + i * 50}ms` }}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                    <ChevronRight className="h-3 w-3 ml-auto group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
