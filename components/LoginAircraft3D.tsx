'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/* ─── Smooth fuselage via LatheGeometry (body of revolution) ──────────── */
function Fuselage() {
  const geom = useMemo(() => {
    // Profile: [radius, y_along_axis] — nose at y=0, tail at y=8.1
    const pts = [
      new THREE.Vector2(0.000, 0.00),  // nose tip
      new THREE.Vector2(0.020, 0.10),
      new THREE.Vector2(0.080, 0.28),
      new THREE.Vector2(0.175, 0.58),
      new THREE.Vector2(0.275, 0.95),
      new THREE.Vector2(0.340, 1.38),
      new THREE.Vector2(0.368, 1.85),
      new THREE.Vector2(0.378, 2.40),  // barrel start
      new THREE.Vector2(0.380, 5.90),  // barrel end
      new THREE.Vector2(0.370, 6.45),
      new THREE.Vector2(0.338, 6.92),
      new THREE.Vector2(0.278, 7.32),
      new THREE.Vector2(0.195, 7.62),
      new THREE.Vector2(0.105, 7.85),
      new THREE.Vector2(0.035, 7.99),
      new THREE.Vector2(0.000, 8.08),  // tail tip
    ]
    const g = new THREE.LatheGeometry(pts, 64)
    // Rotate so axis is along Z (nose forward)
    g.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI / 2))
    // Center: nose at z=+4.04, tail at z=-4.04
    g.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 4.04))
    return g
  }, [])

  return (
    <mesh geometry={geom} castShadow>
      <meshStandardMaterial color="#e6eef6" metalness={0.55} roughness={0.22} />
    </mesh>
  )
}

/* ─── Livery stripe (cylinder band on fuselage) ───────────────────────── */
function Livery() {
  return (
    <>
      {/* Blue cheatline */}
      <mesh position={[0, 0.18, 0.3]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.384, 0.384, 5.5, 64, 1, true, -0.55, 1.1]} />
        <meshStandardMaterial color="#1344a0" side={THREE.FrontSide} metalness={0.15} roughness={0.55} />
      </mesh>
      {/* Red accent */}
      <mesh position={[0, 0.30, 0.3]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.385, 0.385, 5.5, 64, 1, true, -0.32, 0.64]} />
        <meshStandardMaterial color="#b02020" side={THREE.FrontSide} metalness={0.1} roughness={0.6} />
      </mesh>
    </>
  )
}

/* ─── Wing (custom quad BufferGeometry — tapered + swept) ─────────────── */
function Wing({ side }: { side: 1 | -1 }) {
  const geom = useMemo(() => {
    const s = side
    const th = 0.038  // wing thickness half

    // Wing planform corners (x=span, y=up, z=fwd)
    // Root: fuselage radius to chord
    const rLE: [number,number,number] = [s*0.38, 0,    1.30]   // root leading edge
    const rTE: [number,number,number] = [s*0.38, 0,   -0.05]   // root trailing edge
    // Tip: swept back, tapered, slight dihedral
    const tLE: [number,number,number] = [s*3.55, 0.32, -0.22]  // tip leading edge
    const tTE: [number,number,number] = [s*3.55, 0.32, -0.58]  // tip trailing edge

    // Offset for top and bottom surfaces
    const top = (p: [number,number,number]): [number,number,number] => [p[0], p[1]+th, p[2]]
    const bot = (p: [number,number,number]): [number,number,number] => [p[0], p[1]-th*0.3, p[2]]

    const rLEt=top(rLE), rTEt=top(rTE), tLEt=top(tLE), tTEt=top(tTE)
    const rLEb=bot(rLE), rTEb=bot(rTE), tLEb=bot(tLE), tTEb=bot(tTE)

    const v: number[] = []
    const push = (...pts: [number,number,number][]) => pts.forEach(p => v.push(...p))

    // Top surface
    push(rLEt, tLEt, tTEt,  rLEt, tTEt, rTEt)
    // Bottom surface (reversed winding)
    push(rLEb, tTEb, tLEb,  rLEb, rTEb, tTEb)
    // Leading edge
    push(rLEb, rLEt, tLEt,  rLEb, tLEt, tLEb)
    // Trailing edge
    push(rTEt, rTEb, tTEb,  rTEt, tTEb, tTEt)
    // Root cap
    push(rLEt, rLEb, rTEb,  rLEt, rTEb, rTEt)
    // Tip cap
    push(tLEt, tTEb, tLEb,  tLEt, tTEt, tTEb)

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3))
    g.computeVertexNormals()
    return g
  }, [side])

  return (
    <mesh geometry={geom} castShadow>
      <meshStandardMaterial color="#d4e0ec" metalness={0.48} roughness={0.30} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ─── Winglet ─────────────────────────────────────────────────────────── */
function Winglet({ side }: { side: 1|-1 }) {
  const geom = useMemo(() => {
    const s = side
    // Base at wing tip, angles outward and up
    const bLE: [number,number,number] = [s*3.55, 0.32, -0.22]
    const bTE: [number,number,number] = [s*3.55, 0.32, -0.58]
    const tLE: [number,number,number] = [s*3.68, 0.80, -0.32]
    const tTE: [number,number,number] = [s*3.68, 0.80, -0.56]
    const th = 0.022

    const top = (p:[number,number,number]):[number,number,number] => [p[0]+s*th, p[1], p[2]]
    const bot = (p:[number,number,number]):[number,number,number] => [p[0]-s*th, p[1], p[2]]

    const bLEt=top(bLE),bTEt=top(bTE),tLEt=top(tLE),tTEt=top(tTE)
    const bLEb=bot(bLE),bTEb=bot(bTE),tLEb=bot(tLE),tTEb=bot(tTE)
    const v: number[] = []
    const push = (...pts: [number,number,number][]) => pts.forEach(p => v.push(...p))

    if (s === 1) {
      push(bLEt,tLEt,tTEt, bLEt,tTEt,bTEt)
      push(bLEb,tTEb,tLEb, bLEb,bTEb,tTEb)
    } else {
      push(bLEt,tTEt,tLEt, bLEt,bTEt,tTEt)
      push(bLEb,tLEb,tTEb, bLEb,tTEb,bTEb)
    }
    push(bLEt,bLEb,tLEb, bLEt,tLEb,tLEt)
    push(bTEt,tTEb,bTEb, bTEt,tTEt,tTEb)

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(v), 3))
    g.computeVertexNormals()
    return g
  }, [side])

  return (
    <mesh geometry={geom} castShadow>
      <meshStandardMaterial color="#1344a0" metalness={0.3} roughness={0.5} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ─── Engine (proper nacelle with inlet ring) ─────────────────────────── */
function Engine({ side }: { side: 1|-1 }) {
  const s = side
  const x = s*1.08, y=-0.28, z=0.52

  return (
    <group position={[x, y, z]}>
      {/* Pylon */}
      <mesh position={[0, 0.195, -0.06]} rotation={[-0.08,0,0]} castShadow>
        <boxGeometry args={[0.072, 0.30, 0.40]} />
        <meshStandardMaterial color="#a0b0be" metalness={0.55} roughness={0.3} />
      </mesh>
      {/* Nacelle outer */}
      <mesh rotation={[Math.PI/2,0,0]} castShadow>
        <cylinderGeometry args={[0.175, 0.148, 0.80, 40]} />
        <meshStandardMaterial color="#787f88" metalness={0.78} roughness={0.18} />
      </mesh>
      {/* Intake cowl lip */}
      <mesh position={[0,0,0.42]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.186, 0.178, 0.055, 40]} />
        <meshStandardMaterial color="#6a7278" metalness={0.82} roughness={0.15} />
      </mesh>
      {/* Intake ring edge */}
      <mesh position={[0,0,0.448]}>
        <torusGeometry args={[0.182, 0.014, 16, 48]} />
        <meshStandardMaterial color="#3a4048" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Intake interior */}
      <mesh position={[0,0,0.432]} rotation={[Math.PI/2,0,0]}>
        <circleGeometry args={[0.168, 40]} />
        <meshStandardMaterial color="#111416" />
      </mesh>
      {/* Fan disc */}
      <mesh position={[0,0,0.38]} rotation={[Math.PI/2,0,0]}>
        <circleGeometry args={[0.14, 16]} />
        <meshStandardMaterial color="#2a3038" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Fan spinner */}
      <mesh position={[0,0,0.41]} rotation={[-Math.PI/2,0,0]}>
        <coneGeometry args={[0.058, 0.10, 24]} />
        <meshStandardMaterial color="#d8e4f0" metalness={0.6} roughness={0.25} />
      </mesh>
      {/* Exhaust */}
      <mesh position={[0,0,-0.41]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.118, 0.135, 0.10, 32]} />
        <meshStandardMaterial color="#2a3038" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Exhaust interior */}
      <mesh position={[0,0,-0.462]} rotation={[Math.PI/2,0,0]}>
        <circleGeometry args={[0.118, 32]} />
        <meshStandardMaterial color="#0e1214" />
      </mesh>
      {/* Thrust reverser line */}
      <mesh position={[0,0,-0.05]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[0.177, 0.177, 0.04, 40, 1, true]} />
        <meshStandardMaterial color="#555c64" metalness={0.65} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ─── Horizontal stabilizer (custom quad geom) ────────────────────────── */
function HStab({ side }: { side: 1|-1 }) {
  const geom = useMemo(() => {
    const s = side, th = 0.025
    const rLE: [number,number,number] = [s*0.38, 0.06, -2.68]
    const rTE: [number,number,number] = [s*0.38, 0.06, -3.10]
    const tLE: [number,number,number] = [s*1.52, 0.10, -2.98]
    const tTE: [number,number,number] = [s*1.52, 0.10, -3.28]
    const top=(p:[number,number,number]):[number,number,number]=>[p[0],p[1]+th,p[2]]
    const bot=(p:[number,number,number]):[number,number,number]=>[p[0],p[1]-th*0.4,p[2]]
    const [rLEt,rTEt,tLEt,tTEt]=[top(rLE),top(rTE),top(tLE),top(tTE)]
    const [rLEb,rTEb,tLEb,tTEb]=[bot(rLE),bot(rTE),bot(tLE),bot(tTE)]
    const v:number[]=[]
    const push=(...ps:[number,number,number][])=>ps.forEach(p=>v.push(...p))
    push(rLEt,tLEt,tTEt, rLEt,tTEt,rTEt)
    push(rLEb,tTEb,tLEb, rLEb,rTEb,tTEb)
    push(rLEb,rLEt,tLEt, rLEb,tLEt,tLEb)
    push(rTEt,rTEb,tTEb, rTEt,tTEb,tTEt)
    const g=new THREE.BufferGeometry()
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(v),3))
    g.computeVertexNormals()
    return g
  },[side])
  return (
    <mesh geometry={geom} castShadow>
      <meshStandardMaterial color="#d0dcec" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* ─── Vertical stabilizer ─────────────────────────────────────────────── */
function VStab() {
  const geom = useMemo(() => {
    const th = 0.028
    // Root at fuselage top, sweeps up and fwd
    const bLE: [number,number,number] = [0, 0.38, -2.48]
    const bTE: [number,number,number] = [0, 0.38, -3.30]
    const tLE: [number,number,number] = [0, 1.38, -2.80]
    const tTE: [number,number,number] = [0, 1.38, -3.28]
    const L=(p:[number,number,number]):[number,number,number]=>[p[0]-th,p[1],p[2]]
    const R=(p:[number,number,number]):[number,number,number]=>[p[0]+th,p[1],p[2]]
    const bLEL=L(bLE),bTEL=L(bTE),tLEL=L(tLE),tTEL=L(tTE)
    const bLER=R(bLE),bTER=R(bTE),tLER=R(tLE),tTER=R(tTE)
    const v:number[]=[]
    const push=(...ps:[number,number,number][])=>ps.forEach(p=>v.push(...p))
    // Left face
    push(bLEL,tLEL,tTEL, bLEL,tTEL,bTEL)
    // Right face
    push(bLER,tTER,tLER, bLER,bTER,tTER)
    // LE
    push(bLEL,bLER,tLER, bLEL,tLER,tLEL)
    // TE
    push(bTEL,tTER,bTER, bTEL,tTEL,tTER)
    // Root
    push(bLEL,bTER,bLER, bLEL,bTEL,bTER)
    // Tip
    push(tLEL,tLER,tTER, tLEL,tTER,tTEL)
    const g=new THREE.BufferGeometry()
    g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(v),3))
    g.computeVertexNormals()
    return g
  },[])
  return (
    <group>
      <mesh geometry={geom} castShadow>
        <meshStandardMaterial color="#d0dcec" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Blue livery on V-stab */}
      <mesh position={[0, 0.88, -3.02]}>
        <boxGeometry args={[0.058, 0.72, 0.52]} />
        <meshStandardMaterial color="#1344a0" metalness={0.2} roughness={0.55} />
      </mesh>
    </group>
  )
}

/* ─── Cockpit windows ─────────────────────────────────────────────────── */
function CockpitWindows() {
  // Small, flush, realistic cockpit windows
  const wins = [
    { pos: [-0.14, 0.22, 3.32] as [number,number,number], rot: [0, -0.22, 0.12] as [number,number,number] },
    { pos: [ 0.14, 0.22, 3.32] as [number,number,number], rot: [0,  0.22, 0.12] as [number,number,number] },
    { pos: [-0.22, 0.14, 3.28] as [number,number,number], rot: [0, -0.35, 0.08] as [number,number,number] },
    { pos: [ 0.22, 0.14, 3.28] as [number,number,number], rot: [0,  0.35, 0.08] as [number,number,number] },
  ]
  return <>
    {wins.map((w,i) => (
      <mesh key={i} position={w.pos} rotation={w.rot}>
        <boxGeometry args={[0.009, 0.055, 0.065]} />
        <meshStandardMaterial color="#2a6090" emissive="#102840" emissiveIntensity={0.3} metalness={0.1} roughness={0.05} />
      </mesh>
    ))}
  </>
}

/* ─── Passenger windows ───────────────────────────────────────────────── */
function PassengerWindows() {
  // 21 windows each side, evenly spaced along barrel
  const count = 21
  const startZ = 2.6
  const spacing = 0.27

  return <>
    {Array.from({ length: count }, (_, i) => {
      const z = startZ - i * spacing
      return ([1, -1] as const).map(s => (
        <mesh key={`${s}${i}`} position={[s*0.381, 0.10, z]}>
          <boxGeometry args={[0.011, 0.068, 0.082]} />
          <meshStandardMaterial
            color="#4e7aaa"
            emissive="#1a3858"
            emissiveIntensity={0.25}
            metalness={0.05}
            roughness={0.1}
          />
        </mesh>
      ))
    })}
  </>
}

/* ─── Navigation lights ───────────────────────────────────────────────── */
function NavLights() {
  return <>
    <mesh position={[-3.58, 0.30, -0.38]}>
      <sphereGeometry args={[0.026,10,10]}/>
      <meshStandardMaterial color="#ff1c1c" emissive="#ff0000" emissiveIntensity={2.5}/>
    </mesh>
    <mesh position={[3.58, 0.30, -0.38]}>
      <sphereGeometry args={[0.026,10,10]}/>
      <meshStandardMaterial color="#1cff3c" emissive="#00ff20" emissiveIntensity={2.5}/>
    </mesh>
    <mesh position={[0, 1.42, -3.16]}>
      <sphereGeometry args={[0.022,8,8]}/>
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3}/>
    </mesh>
    {/* Landing lights */}
    <mesh position={[0.10, -0.08, 3.60]}>
      <sphereGeometry args={[0.018,8,8]}/>
      <meshStandardMaterial color="#ffffff" emissive="#ffffc0" emissiveIntensity={3}/>
    </mesh>
    <mesh position={[-0.10, -0.08, 3.60]}>
      <sphereGeometry args={[0.018,8,8]}/>
      <meshStandardMaterial color="#ffffff" emissive="#ffffc0" emissiveIntensity={3}/>
    </mesh>
  </>
}

/* ─── Full aircraft ───────────────────────────────────────────────────── */
function Boeing737({ autoRotate }: { autoRotate: boolean }) {
  const ref = useRef<THREE.Group>(null)

  useFrame((_, dt) => {
    if (ref.current && autoRotate) ref.current.rotation.y += dt * 0.14
  })

  return (
    // Start at a nice angle — level, slightly nose-up, slight bank
    <group ref={ref} position={[0, 0.15, 0]} rotation={[0.05, 0.55, 0]} scale={0.95}>
      <Fuselage />
      <Livery />
      <Wing side={1} />
      <Wing side={-1} />
      <Winglet side={1} />
      <Winglet side={-1} />
      <Engine side={1} />
      <Engine side={-1} />
      <HStab side={1} />
      <HStab side={-1} />
      <VStab />
      <CockpitWindows />
      <PassengerWindows />
      <NavLights />
    </group>
  )
}

/* ─── Scene ───────────────────────────────────────────────────────────── */
export default function LoginAircraft3D() {
  return (
    <Canvas
      camera={{ position: [4.5, 1.8, 7.5], fov: 36 }}
      gl={{ antialias: true, alpha: false }}
      shadows
      onCreated={({ gl, scene }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        scene.background = new THREE.Color('#070f1e')
        scene.fog = new THREE.FogExp2('#070f1e', 0.045)
      }}
    >
      {/* Sky hemisphere */}
      <hemisphereLight args={['#1e3a70', '#060e18', 0.65]} />
      {/* Key light — sun from upper right */}
      <directionalLight
        position={[10, 14, 8]} intensity={2.4} castShadow
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={40}
        shadow-camera-left={-10} shadow-camera-right={10}
        shadow-camera-top={10} shadow-camera-bottom={-10}
      />
      {/* Fill — left cool */}
      <directionalLight position={[-7, 5, 4]} intensity={0.55} color="#8ab4ff" />
      {/* Rim — back blue */}
      <directionalLight position={[1, 3, -9]} intensity={0.45} color="#3055b8" />
      {/* Under bounce */}
      <pointLight position={[0,-5,1]} intensity={0.3} color="#1a2a50" />

      {/* Ground */}
      <mesh position={[0,-2.6,0]} rotation={[-Math.PI/2,0,0]} receiveShadow>
        <planeGeometry args={[50,50]}/>
        <meshStandardMaterial color="#050d1a" metalness={0.4} roughness={0.7}/>
      </mesh>
      {/* Subtle ground glow */}
      <pointLight position={[0,-2,0]} intensity={0.6} color="#1a3060" distance={8} decay={2}/>

      <Boeing737 autoRotate />

      <OrbitControls
        enableZoom enablePan={false}
        zoomSpeed={0.5} minDistance={4} maxDistance={16}
        minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/1.65}
        makeDefault
      />
    </Canvas>
  )
}
