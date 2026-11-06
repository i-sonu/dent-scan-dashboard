'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload, Cloud, CheckCircle2, HardDrive, Image as ImageIcon, Wifi,
  Clock, ArrowRight, Server
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { missions } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const uploadStages = [
  { id: 'connection', label: 'Establishing secure connection', detail: 'TLS 1.3 encrypted channel' },
  { id: 'validation', label: 'Validating dataset integrity', detail: 'MD5 checksums verified' },
  { id: 'images', label: 'Uploading RGB images', detail: '892 files' },
  { id: 'depth', label: 'Uploading depth maps', detail: '892 files' },
  { id: 'poses', label: 'Uploading camera poses', detail: 'SLAM trajectory data' },
  { id: 'metadata', label: 'Uploading metadata', detail: 'Mission parameters & telemetry' },
  { id: 'trigger', label: 'Triggering processing job', detail: 'Cloud pipeline initialized' },
]

export default function UploadTransferPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const mission = missions.find((m) => m.id === id) ?? missions[4]

  const [overallProgress, setOverallProgress] = useState(54)
  const [currentStage, setCurrentStage] = useState(2)
  const [stageProgress, setStageProgress] = useState(68)
  const [uploadSpeed, setUploadSpeed] = useState(42.3)
  const [uploaded, setUploaded] = useState(3.1)
  const [eta, setEta] = useState(142)
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setOverallProgress((p) => {
        if (p >= 100) { setDone(true); clearInterval(interval); return 100 }
        return Math.min(100, p + 0.4)
      })
      setStageProgress((p) => {
        if (p >= 100) {
          setCurrentStage((s) => Math.min(s + 1, uploadStages.length - 1))
          return 0
        }
        return p + 1.5
      })
      setUploadSpeed(38 + Math.random() * 12)
      setUploaded((u) => Math.min(5.7, u + 0.02))
      setEta((e) => Math.max(0, e - 2))
    }, 800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-5">
        {/* Header */}
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up', mounted ? '' : 'opacity-0')}>
          <div>
            <h2 className="text-xl font-bold text-foreground">Uploading to Cloud</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{mission.aircraft.registration} — {mission.name}</p>
          </div>
          {done && (
            <Button size="sm" onClick={() => router.push(`/inspections`)} className="gap-2 animate-scale-in">
              View Inspections <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Overall progress card */}
        <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-100', mounted ? '' : 'opacity-0')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-500',
                  done ? 'bg-[oklch(0.55_0.18_145)]/10' : 'bg-blue-50'
                )}>
                  {done
                    ? <CheckCircle2 className="h-5 w-5 text-[oklch(0.55_0.18_145)] animate-scale-in" />
                    : <Cloud className="h-5 w-5 text-primary animate-pulse" />
                  }
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {done ? 'Upload Complete' : 'Upload in Progress'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {done
                      ? 'All files transferred successfully'
                      : `${uploaded.toFixed(1)} GB of ${mission.dataSize ?? '5.7 GB'} transferred`
                    }
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground tabular-nums">{overallProgress.toFixed(0)}%</div>
                {!done && <div className="text-[11px] text-muted-foreground">{eta}s remaining</div>}
              </div>
            </div>
            <div className="h-3 w-full rounded-full bg-[oklch(0.92_0.005_240)] overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', done ? 'bg-[oklch(0.55_0.18_145)]' : 'bg-primary')}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metric cards */}
        <div className={cn('grid grid-cols-2 gap-3 md:grid-cols-4 animate-fade-in-up delay-200', mounted ? '' : 'opacity-0')}>
          {[
            { label: 'Upload Speed', value: `${uploadSpeed.toFixed(1)} MB/s`, icon: Wifi, color: 'text-primary' },
            { label: 'Images', value: (mission.imageCount ?? 892).toLocaleString(), icon: ImageIcon, color: 'text-primary' },
            { label: 'Total Size', value: mission.dataSize ?? '5.7 GB', icon: HardDrive, color: 'text-primary' },
            { label: 'ETA', value: done ? 'Complete' : `${eta}s`, icon: Clock, color: done ? 'text-[oklch(0.55_0.18_145)]' : 'text-muted-foreground' },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <Card
              key={label}
              className="bg-white border-border shadow-none hover:shadow-sm transition-shadow animate-scale-in"
              style={{ animationDelay: `${200 + i * 60}ms` }}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={cn('h-4 w-4 shrink-0', color)} />
                <div>
                  <div className="text-[11px] text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold text-foreground tabular-nums">{value}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pipeline */}
        <Card className={cn('bg-white border-border shadow-none animate-fade-in-up delay-300', mounted ? '' : 'opacity-0')}>
          <CardHeader className="px-5 py-3 border-b border-border">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Server className="h-3.5 w-3.5" />
              Upload Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {uploadStages.map((stage, i) => {
                const isComplete = i < currentStage || (done && i <= currentStage)
                const isActive = i === currentStage && !done

                return (
                  <div
                    key={stage.id}
                    className={cn(
                      'flex items-center gap-4 px-5 py-3 transition-colors duration-300 animate-fade-in-up',
                      isActive && 'bg-blue-50/40'
                    )}
                    style={{ animationDelay: `${300 + i * 50}ms` }}
                  >
                    <div className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-500',
                      isComplete
                        ? 'border-[oklch(0.55_0.18_145)] bg-[oklch(0.55_0.18_145)]/10 text-[oklch(0.55_0.18_145)]'
                        : isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-[oklch(0.97_0.003_240)] text-muted-foreground'
                    )}>
                      {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-xs font-medium transition-colors',
                        isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}>
                        {stage.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{stage.detail}</div>
                      {isActive && (
                        <div className="mt-1.5 h-1 w-full rounded-full bg-[oklch(0.92_0.005_240)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${stageProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px] shrink-0 transition-colors',
                        isComplete
                          ? 'border-[oklch(0.55_0.18_145)]/30 text-[oklch(0.55_0.18_145)]'
                          : isActive
                          ? 'border-primary/30 text-primary'
                          : 'border-border text-muted-foreground'
                      )}
                    >
                      {isComplete ? 'Done' : isActive ? `${stageProgress.toFixed(0)}%` : 'Pending'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
