'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Battery,
  Wifi,
  Navigation,
  Wind,
  Camera,
  StopCircle,
  Gauge,
  Thermometer,
  Clock,
  Image as ImageIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { missions, generateTelemetry } from '@/lib/mock-data'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

export default function MonitoringPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const mission = missions.find((m) => m.id === id) ?? missions[2]

  const [telemetry, setTelemetry] = useState(generateTelemetry(60))
  const [elapsed, setElapsed] = useState(5420)
  const [imageCount, setImageCount] = useState(1180)
  const [progress, setProgress] = useState(42)
  const [stopping, setStopping] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const last = prev[prev.length - 1]
        const next = {
          timestamp: Date.now(),
          altitude: Math.max(6, Math.min(10, last.altitude + (Math.random() - 0.5) * 0.3)),
          battery: Math.max(10, last.battery - 0.08),
          speed: Math.max(3, Math.min(9, last.speed + (Math.random() - 0.5) * 0.6)),
          signal: Math.max(80, Math.min(100, last.signal + (Math.random() - 0.5) * 3)),
          latitude: last.latitude + 0.00002,
          longitude: last.longitude + 0.00003,
          pitch: Math.sin(Date.now() * 0.001) * 3,
          roll: Math.cos(Date.now() * 0.0008) * 2,
          yaw: (last.yaw + 0.5) % 360,
        }
        return [...prev.slice(-59), next]
      })
      setElapsed((e) => e + 2)
      setImageCount((c) => c + Math.floor(Math.random() * 3))
      setProgress((p) => Math.min(100, p + 0.05))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const current = telemetry[telemetry.length - 1]
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const handleStop = async () => {
    setStopping(true)
    await new Promise((r) => setTimeout(r, 1500))
    router.push(`/upload/${id}`)
  }

  const telemetryMetrics = [
    { label: 'Altitude', value: `${current.altitude.toFixed(1)}m`, icon: Navigation, color: 'text-primary', good: true },
    { label: 'Battery', value: `${current.battery.toFixed(0)}%`, icon: Battery, color: current.battery > 40 ? 'text-success' : 'text-warning', good: current.battery > 40 },
    { label: 'Speed', value: `${current.speed.toFixed(1)} m/s`, icon: Gauge, color: 'text-primary', good: true },
    { label: 'Signal', value: `${current.signal.toFixed(0)}%`, icon: Wifi, color: current.signal > 85 ? 'text-success' : 'text-warning', good: true },
    { label: 'Images', value: imageCount.toLocaleString(), icon: ImageIcon, color: 'text-primary', good: true },
    { label: 'Elapsed', value: formatTime(elapsed), icon: Clock, color: 'text-primary', good: true },
  ]

  const chartData = telemetry.slice(-30).map((t, i) => ({
    t: i,
    altitude: +t.altitude.toFixed(2),
    battery: +t.battery.toFixed(1),
    speed: +t.speed.toFixed(2),
  }))

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-2 w-2 rounded-full bg-warning animate-pulse" />
            <h2 className="text-xl font-bold text-foreground">UAV In Flight</h2>
            <Badge variant="outline" className="border-warning/40 text-warning text-xs">Live</Badge>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            disabled={stopping}
            className="gap-2"
          >
            <StopCircle className="h-3.5 w-3.5" />
            {stopping ? 'Returning to Base...' : 'Stop & Return UAV'}
          </Button>
        </div>

        {/* Mission progress */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">{mission.name}</span>
              <span className="text-xs text-muted-foreground">{progress.toFixed(0)}% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>Mission started · {mission.aircraft.registration}</span>
              <span>Est. remaining: {Math.ceil((100 - progress) * 0.12)} min</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Live feed placeholder */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="px-5 py-3 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Camera className="h-3.5 w-3.5" />
                  Live Camera Feed
                </CardTitle>
                <div className="flex items-center gap-1.5 text-[10px] text-destructive">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-secondary/30 flex items-center justify-center overflow-hidden">
                {/* Simulated camera feed */}
                <div className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />
                <div className="text-center space-y-2">
                  <Camera className="h-10 w-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-xs text-muted-foreground">ZED 2i Stereo Camera — RGB Stream</p>
                  <p className="text-[11px] text-muted-foreground/60">2560×1440 @ 30fps · Latency: 120ms</p>
                </div>

                {/* HUD overlay */}
                <div className="absolute top-3 left-3 text-[11px] text-success/80 font-mono space-y-0.5">
                  <div>ALT: {current.altitude.toFixed(1)}m</div>
                  <div>SPD: {current.speed.toFixed(1)}m/s</div>
                  <div>HDG: {current.yaw.toFixed(0)}°</div>
                </div>
                <div className="absolute top-3 right-3 text-[11px] text-success/80 font-mono space-y-0.5 text-right">
                  <div>BAT: {current.battery.toFixed(0)}%</div>
                  <div>SIG: {current.signal.toFixed(0)}%</div>
                  <div>IMG: {imageCount.toLocaleString()}</div>
                </div>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                  <span className="text-[11px] text-destructive font-mono">REC {formatTime(elapsed)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Telemetry panel */}
          <Card className="bg-card border-border">
            <CardHeader className="px-5 py-3 border-b border-border">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Telemetry</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {telemetryMetrics.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-3.5 w-3.5', color)} />
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                  </div>
                  <span className={cn('text-xs font-semibold font-mono', color)}>{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Telemetry charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { key: 'altitude', label: 'Altitude (m)', color: 'var(--color-primary)' },
            { key: 'battery', label: 'Battery (%)', color: 'var(--color-success)' },
            { key: 'speed', label: 'Speed (m/s)', color: 'var(--color-warning)' },
          ].map(({ key, label, color }) => (
            <Card key={key} className="bg-card border-border">
              <CardHeader className="px-4 py-2.5 border-b border-border">
                <CardTitle className="text-[11px] font-medium text-muted-foreground">{label}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={chartData}>
                    <defs>
                      <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 11 }}
                      labelFormatter={() => ''}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
