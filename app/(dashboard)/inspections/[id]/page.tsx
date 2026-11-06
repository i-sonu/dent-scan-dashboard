'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  AlertTriangle, CheckCircle2, Eye, Filter, FileText,
  RotateCcw, ZoomIn, Grid3x3, Box, Layers,
  Upload, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { apiFetch } from '@/lib/api'
import type { DefectSeverity, DefectType } from '@/lib/types'
import { cn } from '@/lib/utils'

const BACKEND_URL = 'http://localhost:8000'

const ModelViewer3D = dynamic(() => import('@/components/ModelViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center h-full gap-3 bg-[#f0f4f8]">
      <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
      <p className="text-[13px] text-muted-foreground">Loading 3D model…</p>
    </div>
  ),
})

interface DefectData {
  id: string
  inspection_id: string
  type: string
  severity: string
  location: string
  description: string | null
  x: number | null
  y: number | null
  width: number | null
  height: number | null
  area: number | null
  depth: number | null
  confidence: number | null
  detected_at: string
  confirmed_by: string | null
  notes: string | null
}

interface InspectionData {
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
  defects: DefectData[]
}

const severityConfig: Record<string, { label: string; textColor: string; badgeCn: string; dot: string; ring: string }> = {
  critical: { label: 'Critical', textColor: 'text-red-600',    badgeCn: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500',    ring: 'ring-red-300' },
  high:     { label: 'High',     textColor: 'text-orange-500', badgeCn: 'bg-orange-50 text-orange-600 border-orange-200', dot: 'bg-orange-400', ring: 'ring-orange-300' },
  medium:   { label: 'Medium',   textColor: 'text-amber-500',  badgeCn: 'bg-amber-50 text-amber-600 border-amber-200',   dot: 'bg-amber-400',  ring: 'ring-amber-300' },
  low:      { label: 'Low',      textColor: 'text-slate-400',  badgeCn: 'bg-slate-50 text-slate-500 border-slate-200',   dot: 'bg-slate-300',  ring: 'ring-slate-200' },
}

const typeLabels: Record<string, string> = {
  dent: 'Dent', corrosion: 'Corrosion', crack: 'Crack',
  delamination: 'Delamination', scratch: 'Scratch', paint_loss: 'Paint Loss', impact_damage: 'Impact Damage',
}

const statusLabels: Record<string, string> = {
  pending_review: 'Pending Review', in_review: 'In Review',
  approved: 'Approved', action_required: 'Action Required',
}

export default function InspectionViewerPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [inspection, setInspection]     = useState<InspectionData | null>(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [selectedDefect, setSelectedDefect] = useState<string | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [viewMode, setViewMode]         = useState<'mesh' | 'wireframe' | 'pointcloud'>('mesh')
  const [showDefects, setShowDefects]   = useState(true)
  const [use3D, setUse3D]               = useState(true)
  const [modelUrl, setModelUrl]         = useState<string | null>(null)
  const [localFile, setLocalFile]       = useState<File | null>(null)

  useEffect(() => {
    apiFetch<InspectionData>(`inspections/${id}`)
      .then(data => {
        setInspection(data)
        // Auto-load GLB from backend if available
        if (data.mesh_url) {
          setModelUrl(`${BACKEND_URL}${data.mesh_url}`)
        }
        if (data.defects.length > 0) {
          setSelectedDefect(data.defects[0].id)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (localFile) URL.revokeObjectURL(modelUrl ?? '')
    const url = URL.createObjectURL(file)
    setLocalFile(file)
    setModelUrl(url)
    setUse3D(true)
  }

  if (loading) return <div className="flex-1 p-5 text-[13px] text-muted-foreground">Loading inspection…</div>
  if (error)   return <div className="flex-1 p-5 text-[13px] text-red-500">{error}</div>
  if (!inspection) return null

  const defects         = inspection.defects
  const filteredDefects = defects.filter(d => filterSeverity === 'all' || d.severity === filterSeverity)
  const selectedDefectData = defects.find(d => d.id === selectedDefect)
  const severities      = ['critical', 'high', 'medium', 'low'] as const
  const ac              = inspection.aircraft

  // Defect markers: only render when defect has x,y percentage coordinates
  const markerDefects = filteredDefects.filter(d => d.x != null && d.y != null)

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-hidden flex flex-col bg-[#f5f6f8] p-5 gap-4">

        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">
                {ac ? `${ac.registration} — ${ac.model}` : inspection.id.slice(0, 8)}
              </h1>
              <Badge className={cn('text-[11px] border',
                inspection.status === 'action_required'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : inspection.status === 'approved'
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200')}>
                {statusLabels[inspection.status] ?? inspection.status}
              </Badge>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {inspection.total_defects} defects · {inspection.critical_defects} critical · Completed {new Date(inspection.completed_at).toLocaleDateString()}
              {inspection.mesh_url && <span className="ml-2 text-blue-500">· 3D model loaded</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-border bg-white px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground shadow-sm transition-colors">
              <Upload className="h-3.5 w-3.5" />
              {localFile ? localFile.name.slice(0, 20) + '…' : 'Load local .glb'}
              <input type="file" accept=".glb,.gltf" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden gap-4 min-h-0">

          {/* 3D Viewer panel */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* View controls */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="flex rounded-lg border border-border overflow-hidden bg-white shadow-sm">
                <button onClick={() => setUse3D(true)}
                  className={cn('px-3 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1.5',
                    use3D ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                  <Box className="h-3 w-3" /> 3D Model
                </button>
                <button onClick={() => setUse3D(false)}
                  className={cn('px-3 py-1.5 text-[12px] font-medium transition-colors flex items-center gap-1.5',
                    !use3D ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                  <Layers className="h-3 w-3" /> SVG View
                </button>
              </div>
              {!use3D && (
                <div className="flex rounded-lg border border-border overflow-hidden bg-white shadow-sm">
                  {(['mesh', 'wireframe', 'pointcloud'] as const).map(mode => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={cn('px-3 py-1.5 text-[12px] font-medium transition-colors',
                        viewMode === mode ? 'bg-foreground text-background' : 'bg-white text-muted-foreground hover:text-foreground')}>
                      {mode === 'pointcloud' ? 'Point Cloud' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setShowDefects(!showDefects)}
                className={cn('flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors shadow-sm',
                  showDefects ? 'border-blue-200 bg-blue-50 text-blue-600' : 'border-border bg-white text-muted-foreground hover:text-foreground')}>
                <Eye className="h-3 w-3" /> Defect Markers
              </button>
              <div className="flex gap-1 ml-auto">
                {[ZoomIn, RotateCcw, Grid3x3].map((Icon, i) => (
                  <Button key={i} variant="outline" size="icon" className="h-7 w-7 bg-white shadow-sm">
                    <Icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Viewer canvas */}
            <Card className="flex-1 bg-white border-border overflow-hidden min-h-0 shadow-none">
              <div className="relative w-full h-full min-h-[380px]">
                {use3D ? (
                  <div className="absolute inset-0">
                    <ModelViewer3D modelUrl={modelUrl} />
                    {!modelUrl && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <p className="text-[12px] text-muted-foreground mt-3 text-center max-w-[260px]">
                          No 3D model available yet. Upload a local .glb to preview.
                        </p>
                      </div>
                    )}
                    {/* Defect markers overlay (only when defects have x,y coords) */}
                    {showDefects && markerDefects.map(defect => {
                      const cfg = severityConfig[defect.severity] ?? severityConfig.low
                      const isSelected = selectedDefect === defect.id
                      return (
                        <button key={defect.id}
                          onClick={() => setSelectedDefect(defect.id === selectedDefect ? null : defect.id)}
                          style={{ left: `${defect.x}%`, top: `${defect.y}%` }}
                          className={cn('absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 border-white transition-all duration-200 shadow-md z-10',
                            isSelected ? `h-8 w-8 ${cfg.dot} ring-4 ${cfg.ring}` : `h-5 w-5 ${cfg.dot} opacity-80 hover:opacity-100 hover:scale-125`)}>
                          {isSelected && <span className="text-[10px] font-bold text-white">!</span>}
                        </button>
                      )
                    })}
                    <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 font-mono pointer-events-none">
                      MODE: 3D · Drag to rotate · Scroll to zoom · Right-click to pan
                    </div>
                  </div>
                ) : (
                  <>
                    <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
                      <defs>
                        <pattern id="viewer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#viewer-grid)" />
                    </svg>
                    <div className="absolute inset-0 bg-[#f0f4f8] flex items-center justify-center">
                      <svg viewBox="0 0 600 300" className="w-full max-w-2xl">
                        <ellipse cx="300" cy="150" rx="220" ry="40" fill={viewMode !== 'pointcloud' ? '#dde8f4' : 'none'} stroke="#3b82f6" strokeWidth={viewMode === 'wireframe' ? 1.5 : 0.8} opacity={0.9} />
                        <ellipse cx="520" cy="150" rx="40" ry="28" fill={viewMode !== 'pointcloud' ? '#e8f0fb' : 'none'} stroke="#3b82f6" strokeWidth="0.8" opacity={0.9} />
                        <ellipse cx="80" cy="150" rx="30" ry="18" fill={viewMode !== 'pointcloud' ? '#dde8f4' : 'none'} stroke="#3b82f6" strokeWidth="0.8" opacity={0.9} />
                        <polygon points="260,150 180,240 130,240 200,150" fill={viewMode !== 'pointcloud' ? '#cfdff0' : 'none'} stroke="#3b82f6" strokeWidth="0.8" opacity={0.8} />
                        <polygon points="260,150 180,60 130,60 200,150" fill={viewMode !== 'pointcloud' ? '#cfdff0' : 'none'} stroke="#3b82f6" strokeWidth="0.8" opacity={0.8} />
                        <polygon points="100,150 80,60 60,55 60,150" fill={viewMode !== 'pointcloud' ? '#dde8f4' : 'none'} stroke="#3b82f6" strokeWidth="0.8" opacity={0.8} />
                        <polygon points="110,150 70,185 55,185 85,150" fill={viewMode !== 'pointcloud' ? '#cfdff0' : 'none'} stroke="#3b82f6" strokeWidth="0.7" opacity={0.7} />
                        <polygon points="110,150 70,115 55,115 85,150" fill={viewMode !== 'pointcloud' ? '#cfdff0' : 'none'} stroke="#3b82f6" strokeWidth="0.7" opacity={0.7} />
                        {viewMode === 'pointcloud' && Array.from({ length: 200 }, (_, i) => (
                          <circle key={i} cx={80 + (i * 7919) % 440} cy={80 + (i * 6271) % 140} r="1" fill="#3b82f6" opacity={0.4} />
                        ))}
                      </svg>
                    </div>
                    {showDefects && markerDefects.map(defect => {
                      const cfg = severityConfig[defect.severity] ?? severityConfig.low
                      const isSelected = selectedDefect === defect.id
                      return (
                        <button key={defect.id}
                          onClick={() => setSelectedDefect(defect.id === selectedDefect ? null : defect.id)}
                          style={{ left: `${defect.x}%`, top: `${defect.y}%` }}
                          className={cn('absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-2 border-white transition-all duration-200 shadow-md',
                            isSelected ? `h-8 w-8 ${cfg.dot} ring-4 ${cfg.ring}` : `h-5 w-5 ${cfg.dot} opacity-80 hover:opacity-100 hover:scale-125`)}>
                          {isSelected && <span className="text-[10px] font-bold text-white">!</span>}
                        </button>
                      )
                    })}
                    <div className="absolute bottom-3 left-3 text-[10px] text-slate-400 font-mono">
                      MODE: {viewMode.toUpperCase()} · Schematic View
                    </div>
                  </>
                )}
                <div className="absolute top-3 right-3 text-[11px] text-slate-400 pointer-events-none">
                  {use3D ? 'Drag to rotate · Scroll to zoom · Right-click to pan' : 'SVG schematic'}
                </div>
              </div>
            </Card>
          </div>

          {/* Right panel */}
          <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto">

            {/* Severity filter */}
            <Card className="bg-white border-border shadow-none shrink-0">
              <CardHeader className="px-4 py-2.5 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Filter className="h-3 w-3" /> Filter by Severity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-1">
                <button onClick={() => setFilterSeverity('all')}
                  className={cn('w-full rounded-md px-3 py-1.5 text-left text-[12px] transition-colors',
                    filterSeverity === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-slate-50')}>
                  All defects ({defects.length})
                </button>
                {severities.map(s => {
                  const cfg = severityConfig[s]
                  const count = defects.filter(d => d.severity === s).length
                  if (!count) return null
                  return (
                    <button key={s} onClick={() => setFilterSeverity(s)}
                      className={cn('w-full rounded-md px-3 py-1.5 text-left text-[12px] flex items-center gap-2 transition-colors',
                        filterSeverity === s ? 'bg-slate-100 text-foreground' : 'text-muted-foreground hover:bg-slate-50')}>
                      <span className={cn('h-2 w-2 rounded-full shrink-0', cfg.dot)} />
                      <span>{cfg.label}</span>
                      <span className="ml-auto text-muted-foreground">{count}</span>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Selected defect detail */}
            {selectedDefectData && (
              <Card className="bg-white border-border shadow-none shrink-0">
                <CardHeader className="px-4 py-2.5 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Defect Detail</CardTitle>
                    <Badge className={cn('text-[11px] border', severityConfig[selectedDefectData.severity]?.badgeCn ?? '')}>
                      {severityConfig[selectedDefectData.severity]?.label ?? selectedDefectData.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{typeLabels[selectedDefectData.type] ?? selectedDefectData.type}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{selectedDefectData.location}</div>
                  </div>
                  {selectedDefectData.description && (
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{selectedDefectData.description}</p>
                  )}

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDefectData.area != null && (
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Area</div>
                        <div className="text-[13px] font-semibold text-foreground mt-0.5">{selectedDefectData.area.toLocaleString()} mm²</div>
                      </div>
                    )}
                    {selectedDefectData.depth != null && (
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Depth</div>
                        <div className="text-[13px] font-semibold text-foreground mt-0.5">{selectedDefectData.depth} mm</div>
                      </div>
                    )}
                    {selectedDefectData.width != null && (
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Width</div>
                        <div className="text-[13px] font-semibold text-foreground mt-0.5">{selectedDefectData.width} mm</div>
                      </div>
                    )}
                    {selectedDefectData.confidence != null && (
                      <div className="rounded-lg bg-slate-50 p-2.5">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Confidence</div>
                        <div className="text-[13px] font-semibold text-foreground mt-0.5">{Math.round(selectedDefectData.confidence * 100)}%</div>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Detected: {new Date(selectedDefectData.detected_at).toLocaleString()}
                  </div>
                  {selectedDefectData.confirmed_by && (
                    <div className="text-[11px] text-muted-foreground">Confirmed by: {selectedDefectData.confirmed_by}</div>
                  )}
                  {selectedDefectData.notes && (
                    <div className="text-[11px] text-muted-foreground italic">{selectedDefectData.notes}</div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Defect list */}
            <Card className="bg-white border-border shadow-none">
              <CardHeader className="px-4 py-2.5 border-b border-border">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  All Defects ({filteredDefects.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredDefects.length === 0 ? (
                  <p className="px-4 py-3 text-[12px] text-muted-foreground">No defects found.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredDefects.map(defect => {
                      const cfg = severityConfig[defect.severity] ?? severityConfig.low
                      return (
                        <button key={defect.id}
                          onClick={() => setSelectedDefect(defect.id === selectedDefect ? null : defect.id)}
                          className={cn('w-full flex items-center gap-2.5 px-4 py-3 text-left transition-colors',
                            selectedDefect === defect.id ? 'bg-slate-50' : 'hover:bg-slate-50')}>
                          <span className={cn('h-2 w-2 rounded-full shrink-0', cfg.dot)} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[12px] font-medium text-foreground">{typeLabels[defect.type] ?? defect.type}</div>
                            <div className="text-[11px] text-muted-foreground truncate">{defect.location}</div>
                          </div>
                          <Badge className={cn('text-[10px] border shrink-0', cfg.badgeCn)}>{cfg.label}</Badge>
                        </button>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  )
}
