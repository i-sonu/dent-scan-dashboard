'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, Plane, Shield, Globe, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

function FlightPathBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 900 700" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>
        <style>{`
          @keyframes dash1{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
          @keyframes dash2{from{stroke-dashoffset:800}to{stroke-dashoffset:0}}
          @keyframes dash3{from{stroke-dashoffset:500}to{stroke-dashoffset:0}}
          .fp1{stroke-dasharray:600;animation:dash1 8s ease-in-out infinite}
          .fp2{stroke-dasharray:800;animation:dash2 11s ease-in-out infinite 1.5s}
          .fp3{stroke-dasharray:500;animation:dash3 9s ease-in-out infinite 3s}
          .fp4{stroke-dasharray:700;animation:dash1 12s ease-in-out infinite 0.8s}
          .fp5{stroke-dasharray:450;animation:dash2 7s ease-in-out infinite 4s}
          .fp6{stroke-dasharray:550;animation:dash3 10s ease-in-out infinite 2.2s}
        `}</style>
      </defs>
      <ellipse cx="220" cy="300" rx="260" ry="220" fill="url(#g1)" />
      <g opacity="0.06" stroke="#60a5fa" strokeWidth="0.8" fill="none">
        <path d="M340,180 Q360,200 355,240 Q350,280 330,310 Q310,340 320,380 Q335,420 310,450" />
        <path d="M355,180 Q380,190 400,210 Q420,230 415,260" />
        <path d="M120,150 Q140,170 145,200 Q150,240 130,270 Q110,300 120,340 Q140,380 120,420" />
        <path d="M560,140 Q620,150 680,170 Q740,190 780,220 Q810,245 800,280" />
        <path d="M680,170 Q700,200 720,230 Q730,260 710,290 Q690,310 700,340" />
        <path d="M700,440 Q740,435 770,450 Q800,465 790,490 Q775,510 745,515 Q715,515 700,495 Q690,475 700,455 Z" />
      </g>
      <g opacity="0.07" fill="#60a5fa">
        {Array.from({length:12},(_,c)=>Array.from({length:8},(_,r)=>(
          <circle key={`${c}-${r}`} cx={60+c*72} cy={70+r*80} r="1.2"/>
        )))}
      </g>
      <g fill="none" stroke="#3b82f6" strokeLinecap="round">
        <path className="fp1" d="M80,520 Q280,80 540,200"  strokeWidth="1.2" opacity="0.35"/>
        <path className="fp2" d="M160,480 Q400,120 720,280" strokeWidth="1"   opacity="0.28"/>
        <path className="fp3" d="M240,560 Q380,200 680,160" strokeWidth="0.9" opacity="0.22"/>
        <path className="fp4" d="M60,320 Q300,420 620,380"  strokeWidth="1.1" opacity="0.30"/>
        <path className="fp5" d="M200,580 Q450,300 780,440" strokeWidth="0.8" opacity="0.20"/>
        <path className="fp6" d="M100,200 Q350,350 700,300" strokeWidth="0.9" opacity="0.25"/>
      </g>
      <g fill="#60a5fa">
        {[[80,520],[540,200],[160,480],[720,280],[60,320],[620,380],[240,560],[680,160]].map(([x,y],i)=>(
          <circle key={i} cx={x} cy={y} r={i<4?3:2} opacity={i<4?0.5:0.35}/>
        ))}
      </g>
      <g fill="#3b82f6" opacity="0.18" fontFamily="monospace" fontSize="9">
        <text x="72"  y="517">DXB</text>
        <text x="534" y="197">LHR</text>
        <text x="154" y="477">JFK</text>
        <text x="714" y="277">NRT</text>
        <text x="54"  y="317">LAX</text>
        <text x="614" y="377">SIN</text>
      </g>
    </svg>
  )
}

const stats = [
  { value:'2,847', label:'Inspections' },
  { value:'142',   label:'Aircraft' },
  { value:'99.2%', label:'AI Accuracy' },
  { value:'18',    label:'Countries' },
]

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = searchParams.get('callbackUrl') || '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError(data.error || 'Invalid credentials')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#060d1a]">

      {/* LEFT — Brand panel */}
      <div className="hidden lg:flex lg:w-[54%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#060d1a] via-[#091428] to-[#0a1830]" />
        <div className="absolute inset-0"><FlightPathBackground /></div>
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#060d1a] to-transparent pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-l from-[#060d1a] to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Plane className="h-[18px] w-[18px] text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-white tracking-tight">Aerosepct</div>
              <div className="text-[10px] text-blue-400/60 tracking-[0.2em] uppercase font-medium">Jiair Falcon Suite</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-[420px]">
            <div className="inline-flex items-center gap-2 mb-7 self-start">
              <div className="h-px w-6 bg-blue-500/60" />
              <span className="text-[11px] font-semibold text-blue-400 tracking-widest uppercase">UAV Inspection Platform</span>
            </div>
            <h1 className="text-[42px] font-bold text-white leading-[1.1] tracking-tight mb-5">
              Inspect Smarter.<br />
              <span className="text-blue-400">Fly Safer.</span>
            </h1>
            <p className="text-[14px] text-white/40 leading-relaxed max-w-[360px]">
              Enterprise-grade aircraft inspection powered by autonomous UAVs and AI defect detection. Trusted by MRO teams across 18 countries.
            </p>
            <div className="grid grid-cols-4 gap-4 mt-10 pt-10 border-t border-white/8">
              {stats.map(({value,label})=>(
                <div key={label}>
                  <div className="text-[22px] font-bold text-white tracking-tight">{value}</div>
                  <div className="text-[11px] text-white/35 mt-0.5 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-5">
            {[{icon:Shield,label:'SOC 2 Type II'},{icon:Globe,label:'EASA Compliant'},{icon:Lock,label:'End-to-End Encrypted'}].map(({icon:Icon,label})=>(
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-white/25" strokeWidth={1.5}/>
                <span className="text-[11px] text-white/25 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT — Login form */}
      <div className="flex flex-1 items-center justify-center bg-[#f4f6f9] relative px-8">
        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-blue-600 to-blue-400" />
        <div className="w-full max-w-[380px]">

          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Plane className="h-4 w-4 text-white" strokeWidth={2}/>
            </div>
            <span className="text-[15px] font-bold text-gray-900">Aerosepct</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-gray-900 tracking-tight">Sign in</h2>
            <p className="text-[13px] text-gray-400 mt-1.5 font-medium">
              Enter your credentials to access the platform
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw?'text':'password'}
                  value={password}
                  onChange={e=>setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-900 placeholder:text-gray-300 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
                <button type="button" onClick={()=>setShowPw(s=>!s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                  {showPw?<EyeOff className="h-[18px] w-[18px]"/>:<Eye className="h-[18px] w-[18px]"/>}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3.5 py-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0"/>
                <span className="text-[12px] text-red-600 font-medium">{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className={cn(
                'w-full h-11 rounded-lg flex items-center justify-center gap-2 text-[13px] font-semibold text-white transition-all mt-2',
                'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-md shadow-blue-600/20',
                loading && 'opacity-70 cursor-not-allowed'
              )}>
              {loading ? (
                <><span className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white animate-spin"/><span>Authenticating…</span></>
              ) : (
                <><span>Sign In</span><ArrowRight className="h-4 w-4"/></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-[11px] text-gray-400 font-medium">credentials</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Admin Access</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-20">Username</span>
                  <span className="font-mono font-bold text-gray-800">admin</span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className="text-gray-400 w-20">Password</span>
                  <span className="font-mono font-bold text-gray-800">Admin@Aero#2025!</span>
                </div>
              </div>
              <button type="button"
                onClick={()=>{setUsername('admin');setPassword('Admin@Aero#2025!')}}
                className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0">
                Auto-fill
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-[11px] text-gray-400">
            © 2025 Aerosepct
          </p>
        </div>
      </div>
    </div>
  )
}
