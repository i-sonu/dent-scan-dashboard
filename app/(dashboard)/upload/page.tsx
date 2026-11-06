'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, CloudUpload, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const recentUploads = [
  { id: 'u1', name: 'M001_N737AA_scan.zip', size: '18.4 GB', status: 'Processed', missionId: 'ms1', time: '2h ago' },
  { id: 'u2', name: 'M005_N8511X_landing_gear.zip', size: '5.7 GB', status: 'Processing', missionId: 'ms5', time: '18m ago' },
  { id: 'u3', name: 'M002_FGKXA_fuselage.zip', size: '9.2 GB', status: 'Processing', missionId: 'ms2', time: '45m ago' },
]

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5">
        {/* Header */}
        <div className={cn('mb-5 animate-fade-in-up', mounted ? '' : 'opacity-0')}>
          <h1 className="text-xl font-bold text-foreground">Data Upload</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Upload UAV imagery and sensor data for AI processing</p>
        </div>

        <div className="max-w-2xl space-y-4">
          {/* Drop zone */}
          <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-100', mounted ? '' : 'opacity-0')}>
            <CardContent className="p-8">
              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 transition-all duration-300',
                  dragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border hover:border-primary/40 hover:bg-[oklch(0.97_0.003_240)]'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={() => setDragging(false)}
              >
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300',
                  dragging ? 'bg-primary/15 scale-110' : 'bg-blue-50'
                )}>
                  <CloudUpload className={cn('h-7 w-7 transition-colors', dragging ? 'text-primary' : 'text-blue-500')} strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-[15px] font-semibold text-foreground">Drop files here or click to upload</p>
                  <p className="text-[13px] text-muted-foreground mt-1">Supports JPEG, RAW, MP4, and sensor CSV files</p>
                </div>
                <Button size="sm" className="gap-2 hover:scale-105 transition-transform">
                  <Upload className="h-3.5 w-3.5" /> Browse Files
                </Button>
              </div>

              {/* Supported formats */}
              <div className="flex items-center gap-2 justify-center mt-4 flex-wrap">
                {['JPEG', 'RAW', 'MP4', 'CSV', 'LAS', 'PLY'].map((fmt) => (
                  <Badge key={fmt} variant="outline" className="text-[10px] text-muted-foreground border-border font-mono">
                    {fmt}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent uploads */}
          <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-200', mounted ? '' : 'opacity-0')}>
            <CardHeader className="pb-0 pt-4 px-5">
              <h2 className="text-[14px] font-semibold text-foreground">Recent Uploads</h2>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-3 space-y-3">
              {recentUploads.map((f, i) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-[oklch(0.97_0.003_240)] transition-all duration-200 animate-fade-in-up group"
                  style={{ animationDelay: `${200 + i * 80}ms` }}
                >
                  <div className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    f.status === 'Processed' ? 'bg-[oklch(0.55_0.18_145)]/10' : 'bg-blue-50'
                  )}>
                    {f.status === 'Processed'
                      ? <CheckCircle2 className="h-4.5 w-4.5 text-[oklch(0.55_0.18_145)]" strokeWidth={1.5} />
                      : <CloudUpload className="h-4.5 w-4.5 text-blue-500 animate-pulse" strokeWidth={1.5} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-foreground truncate">{f.name}</div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{f.size}</span>
                      <span>·</span>
                      <Clock className="h-3 w-3" />
                      <span>{f.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn(
                      'text-[12px] font-semibold',
                      f.status === 'Processed' ? 'text-[oklch(0.55_0.18_145)]' : 'text-blue-500'
                    )}>
                      {f.status}
                    </span>
                    {f.status === 'Processed' && (
                      <Link href={`/missions/${f.missionId}`}>
                        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 border-border opacity-0 group-hover:opacity-100 transition-opacity">
                          View <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upload tips */}
          <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-300', mounted ? '' : 'opacity-0')}>
            <CardContent className="p-5">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Upload Tips</div>
              <div className="space-y-2">
                {[
                  'Organize files in mission folders for automatic metadata linking',
                  'Ensure images have GPS EXIF data for accurate 3D reconstruction',
                  'Recommended overlap: 80% frontal, 70% lateral for optimal results',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 animate-fade-in-up" style={{ animationDelay: `${350 + i * 60}ms` }}>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
