'use client'

import { useState } from 'react'
import { ChevronRight, Check, AlertTriangle, Settings2, Users, Plane } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const inspectionTypes = [
  { id: 'full_body', label: 'Full Body Scan',     desc: '360° complete fuselage coverage' },
  { id: 'partial',  label: 'Partial Inspection',  desc: 'Targeted area scan only' },
  { id: 'spot',     label: 'Spot Check',           desc: 'Single zone quick scan' },
]

const preFlightChecks = [
  { label: 'Battery Level', value: '96%' },
  { label: 'Sensors',       value: 'Online' },
  { label: 'Camera',        value: '48MP Ready' },
  { label: 'Storage',       value: '412 GB Free' },
  { label: 'Comm Link',     value: 'Strong' },
]

export default function NewMissionPage() {
  const [inspectionType, setInspectionType] = useState('full_body')
  const [altitude,       setAltitude]       = useState('8')
  const [overlap,        setOverlap]        = useState('75')
  const [standoff,       setStandoff]       = useState('3.5')
  const [scanDensity,    setScanDensity]    = useState('High (2mm/px)')
  const [captureMode,    setCaptureMode]    = useState('Continuous')
  const [cameraAngle,    setCameraAngle]    = useState('Perpendicular')
  const [uav,            setUav]            = useState('DJI Matrice 350 RTK – Unit #DM-042')
  const [operator,       setOperator]       = useState('Marcus Reinholt (Primary)')
  const [missionName,    setMissionName]    = useState('N847WN-FULLBODY-20250612')
  const [scheduledTime,  setScheduledTime]  = useState('2025-06-12 09:30 UTC')

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-[#f5f6f8] p-5">
        <div className="max-w-[1200px] mx-auto space-y-4">

          {/* Breadcrumb + Progress */}
          <div className="flex items-center justify-between animate-fade-in-up">
            <div className="flex items-center gap-1.5 text-[13px]">
              <Link href="/dashboard" className="text-primary font-medium hover:underline transition-colors">Dashboard</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <Link href="/missions" className="text-muted-foreground hover:text-primary transition-colors">Missions</Link>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">New Mission Setup</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-muted-foreground">Step 1 of 1</span>
              <div className="w-28 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full w-full bg-primary rounded-full" style={{ animation: 'barGrow 0.8s ease 200ms both' }} />
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-3 gap-5">

            {/* LEFT: Form */}
            <div className="col-span-2 space-y-4">

              {/* Aircraft Selection */}
              <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-up delay-100">
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" strokeWidth={2} />
                    <h3 className="text-[14px] font-bold text-foreground">Aircraft Selection</h3>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="flex gap-4">
                    {/* Aircraft image */}
                    <div className="w-[130px] h-[90px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-border">
                      <img
                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/mission-IwDtzd9QKtvFomBzTAdc6aSB9LxA2a.jpg"
                        alt="Boeing 737-800"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[18px] font-bold text-foreground">Boeing 737-800</span>
                        <span className="text-[12px] font-medium text-primary">Narrow Body</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <div className="text-[11px] text-muted-foreground">Tail Number</div>
                          <div className="text-[13px] font-semibold text-foreground">N847WN</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground">Operator</div>
                          <div className="text-[13px] font-semibold text-foreground">SkyWest Airlines</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-muted-foreground">Last Inspection</div>
                          <div className="text-[13px] font-semibold text-foreground">14 Mar 2025</div>
                        </div>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-[12px] text-amber-700 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Scheduled C-Check — Due 28 Jun 2025
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inspection Type */}
              <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-up delay-150">
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" strokeWidth={2} />
                    <h3 className="text-[14px] font-bold text-foreground">Inspection Type</h3>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-3 gap-3">
                    {inspectionTypes.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setInspectionType(opt.id)}
                        className={cn(
                          'relative p-4 rounded-lg border-2 text-left transition-all duration-200 hover:border-primary/50 group',
                          inspectionType === opt.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border bg-white hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={cn(
                            'h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors',
                            inspectionType === opt.id ? 'border-primary' : 'border-gray-300'
                          )}>
                            {inspectionType === opt.id && (
                              <div className="h-2 w-2 rounded-full bg-primary animate-scale-in" />
                            )}
                          </div>
                        </div>
                        <div className="text-[13px] font-bold text-foreground">{opt.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Scan Parameters */}
              <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-up delay-200">
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-primary" strokeWidth={2} />
                    <h3 className="text-[14px] font-bold text-foreground">Scan Parameters</h3>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Altitude (m)',          value: altitude,  set: setAltitude,  type: 'number' },
                      { label: 'Image Overlap (%)',      value: overlap,   set: setOverlap,   type: 'number' },
                      { label: 'Stand-off Distance (m)', value: standoff,  set: setStandoff,  type: 'number' },
                    ].map(({ label, value, set, type }) => (
                      <div key={label} className="space-y-1.5">
                        <Label className="text-[12px] text-muted-foreground">{label}</Label>
                        <Input
                          type={type}
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          className="h-10 bg-white border-border text-[13px] text-center font-medium transition-all focus:border-primary/40"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Scan Density',  value: scanDensity, set: setScanDensity, opts: ['Low (0.5mm/px)', 'High (2mm/px)', 'Ultra (1mm/px)'] },
                      { label: 'Capture Mode',  value: captureMode, set: setCaptureMode, opts: ['Single Pass', 'Continuous', 'Burst Mode'] },
                      { label: 'Camera Angle',  value: cameraAngle, set: setCameraAngle, opts: ['Perpendicular', 'Angled 30°', 'Nadir'] },
                    ].map(({ label, value, set, opts }) => (
                      <div key={label} className="space-y-1.5">
                        <Label className="text-[12px] text-muted-foreground">{label}</Label>
                        <select
                          value={value}
                          onChange={(e) => set(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[13px] text-foreground cursor-pointer transition-all focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 appearance-none"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                        >
                          {opts.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Assignment & Scheduling */}
              <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-up delay-300">
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" strokeWidth={2} />
                    <h3 className="text-[14px] font-bold text-foreground">Assignment &amp; Scheduling</h3>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">UAV Selection</Label>
                      <select
                        value={uav}
                        onChange={(e) => setUav(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[13px] text-foreground cursor-pointer transition-all focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                      >
                        <option>DJI Matrice 350 RTK – Unit #DM-042</option>
                        <option>DJI Matrice 300 RTK – Unit #DM-041</option>
                        <option>Freefly Alta X – Unit #FX-001</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">Operator Assignment</Label>
                      <select
                        value={operator}
                        onChange={(e) => setOperator(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-white text-[13px] text-foreground cursor-pointer transition-all focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 appearance-none"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                      >
                        <option>Marcus Reinholt (Primary)</option>
                        <option>Sarah Johnson (Secondary)</option>
                        <option>James Chen (Backup)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">Mission Name</Label>
                      <Input
                        value={missionName}
                        onChange={(e) => setMissionName(e.target.value)}
                        className="h-10 bg-white border-border text-[13px] text-center transition-all focus:border-primary/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[12px] text-muted-foreground">Scheduled Time</Label>
                      <Input
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="h-10 bg-white border-border text-[13px] text-center transition-all focus:border-primary/40"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="col-span-1 space-y-4">

              {/* Pre-Flight System Check */}
              <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-right delay-150">
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-green-100">
                      <Check className="h-3 w-3 text-green-600" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[14px] font-bold text-foreground">Pre-Flight System Check</h3>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  {preFlightChecks.map(({ label, value }, i) => (
                    <div
                      key={label}
                      className="flex items-center justify-between animate-fade-in-up"
                      style={{ animationDelay: `${200 + i * 80}ms` }}
                    >
                      <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                        <div className="h-2 w-2 rounded-sm bg-green-400" />
                        {label}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold text-green-600">{value}</span>
                        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                          <Check className="h-2.5 w-2.5 text-green-600" strokeWidth={3} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[13px] font-semibold text-green-700">All Systems Nominal</span>
                  </div>
                </CardContent>
              </Card>

              {/* Flight Path Preview */}
              <Card className="bg-white border-border shadow-none rounded-lg animate-fade-in-right delay-250">
                <CardHeader className="px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" strokeWidth={2} />
                    <h3 className="text-[14px] font-bold text-foreground">Flight Path Preview</h3>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  {/* Radar SVG */}
                  <div className="rounded-xl bg-gradient-to-br from-[#dbeafe] to-[#eff6ff] flex items-center justify-center p-4 mb-4">
                    <svg viewBox="0 0 220 220" className="w-full max-w-[180px]" style={{ animation: 'fadeIn 0.6s ease 400ms both' }}>
                      {/* Grid lines */}
                      {[44, 88, 132, 176].map(r => (
                        <circle key={r} cx="110" cy="110" r={r/2} fill="none" stroke="#93c5fd" strokeWidth="0.8" />
                      ))}
                      <line x1="110" y1="22" x2="110" y2="198" stroke="#93c5fd" strokeWidth="0.8" />
                      <line x1="22"  y1="110" x2="198" y2="110" stroke="#93c5fd" strokeWidth="0.8" />
                      <line x1="47"  y1="47"  x2="173" y2="173" stroke="#93c5fd" strokeWidth="0.5" strokeDasharray="3,3" />
                      <line x1="173" y1="47"  x2="47"  y2="173" stroke="#93c5fd" strokeWidth="0.5" strokeDasharray="3,3" />

                      {/* Orbit path */}
                      <circle cx="110" cy="110" r="78" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="6,4" />

                      {/* Aircraft body */}
                      <g transform="translate(110,110)">
                        <polygon points="0,-28 -7,-8 0,-12 7,-8" fill="#1e3a8a" />
                        <polygon points="0,-12 -18,2 -16,8 0,0 16,8 18,2" fill="#1e40af" />
                        <polygon points="0,0 -5,18 0,14 5,18" fill="#1e3a8a" />
                        <polygon points="-16,8 -28,16 -24,18 -16,12" fill="#1e40af" />
                        <polygon points="16,8 28,16 24,18 16,12" fill="#1e40af" />
                      </g>

                      {/* Waypoints */}
                      <circle cx="188" cy="110" r="5"  fill="#f59e0b" className="animate-pulse-dot" />
                      <circle cx="110" cy="32"  r="5"  fill="#10b981" />
                      <circle cx="32"  cy="110" r="4"  fill="#3b82f6" opacity="0.7" />
                      <circle cx="110" cy="188" r="4"  fill="#3b82f6" opacity="0.7" />
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-4 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-primary" />Orbit Path</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Waypoints</span>
                    <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-green-500" />Start/End</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Waypoints', value: '148' },
                      { label: 'Est. Duration',   value: '42 min' },
                      { label: 'Flight Distance', value: '1.8 km' },
                      { label: 'Images Est.',     value: '2,340' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-[11px] text-muted-foreground">{label}</div>
                        <div className="text-[15px] font-bold text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mission Ready */}
              <Card className="bg-[#eff6ff] border-blue-200 shadow-none rounded-lg animate-fade-in-right delay-350">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </div>
                    <h3 className="text-[14px] font-bold text-foreground">Mission Ready</h3>
                  </div>
                  <p className="text-[13px] text-primary leading-relaxed">
                    All pre-flight checks passed. Aircraft, UAV, and operator confirmed. Flight path generated and validated.
                  </p>
                  <Link href="/monitoring/1">
                    <Button className="w-full h-11 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold text-[14px] rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.99] mt-1">
                      Start Mission
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-9 text-[13px] font-medium border-border bg-white hover:bg-gray-50 transition-all duration-200"
                    >
                      Save Draft
                    </Button>
                    <Link href="/missions">
                      <Button
                        variant="outline"
                        className="w-full h-9 text-[13px] font-medium border-border bg-white hover:bg-gray-50 transition-all duration-200"
                      >
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
