'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, Grid, Center, Box as DreiBox } from '@react-three/drei'
import { Loader2, Box, Layers } from 'lucide-react'
import * as THREE from 'three'

// Default placeholder aircraft model when no file is loaded
function PlaceholderAircraft({ wireframe }: { wireframe: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.3
    }
  })

  const mat = (color: string) => (
    <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.3} roughness={0.5} />
  )

  return (
    <group ref={groupRef} scale={1.5}>
      {/* Fuselage */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 2.8, 32]} />
        {mat('#c8d8e8')}
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 0, 1.5]}>
        <coneGeometry args={[0.18, 0.5, 24]} />
        {mat('#b8c8d8')}
      </mesh>
      {/* Tail cone */}
      <mesh position={[0, 0, -1.55]}>
        <coneGeometry args={[0.12, 0.4, 24]} />
        {mat('#b0c0d0')}
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.9, 0, 0.1]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[1.5, 0.04, 0.55]} />
        {mat('#c0d0e0')}
      </mesh>
      {/* Right wing */}
      <mesh position={[0.9, 0, 0.1]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[1.5, 0.04, 0.55]} />
        {mat('#c0d0e0')}
      </mesh>
      {/* Left winglet */}
      <mesh position={[-1.65, 0.12, 0.1]} rotation={[0, 0, -1.1]}>
        <boxGeometry args={[0.28, 0.04, 0.14]} />
        {mat('#b0c8de')}
      </mesh>
      {/* Right winglet */}
      <mesh position={[1.65, 0.12, 0.1]} rotation={[0, 0, 1.1]}>
        <boxGeometry args={[0.28, 0.04, 0.14]} />
        {mat('#b0c8de')}
      </mesh>
      {/* Horizontal stabilizer left */}
      <mesh position={[-0.42, 0, -1.3]}>
        <boxGeometry args={[0.72, 0.035, 0.28]} />
        {mat('#b8c8d8')}
      </mesh>
      {/* Horizontal stabilizer right */}
      <mesh position={[0.42, 0, -1.3]}>
        <boxGeometry args={[0.72, 0.035, 0.28]} />
        {mat('#b8c8d8')}
      </mesh>
      {/* Vertical stabilizer */}
      <mesh position={[0, 0.28, -1.2]}>
        <boxGeometry args={[0.04, 0.55, 0.38]} />
        {mat('#b8c8d8')}
      </mesh>
      {/* Left engine */}
      <mesh position={[-0.7, -0.12, 0.35]}>
        <cylinderGeometry args={[0.1, 0.09, 0.4, 20]} />
        {mat('#8090a0')}
      </mesh>
      {/* Right engine */}
      <mesh position={[0.7, -0.12, 0.35]}>
        <cylinderGeometry args={[0.1, 0.09, 0.4, 20]} />
        {mat('#8090a0')}
      </mesh>
      {/* Windows strip */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0.225, 0.06, 0.9 - i * 0.22]}>
          <boxGeometry args={[0.01, 0.055, 0.07]} />
          <meshStandardMaterial color="#4a90d9" wireframe={wireframe} emissive="#1a60a9" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// Loaded GLTF model component
function GltfModel({ url, wireframe }: { url: string; wireframe: boolean }) {
  const { scene } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (!scene) return
    // Apply wireframe to all mesh children
    scene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m: any) => { m.wireframe = wireframe })
      }
    })
  }, [scene, wireframe])

  // Auto-center and scale the model
  useEffect(() => {
    if (!scene || !groupRef.current) return
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z)
    const targetSize = 3.5
    const scale = targetSize / maxDim
    groupRef.current.scale.setScalar(scale)
    groupRef.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale)
  }, [scene])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

// Camera auto-fit on load
function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.position.set(4, 2.5, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])
  return null
}

interface ModelViewer3DProps {
  modelUrl: string | null
}

export default function ModelViewer3D({ modelUrl }: ModelViewer3DProps) {
  const [wireframe, setWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [loadError, setLoadError] = useState(false)

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#e8eff8] to-[#d0dce8]">
      <Canvas
        camera={{ position: [4, 2.5, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        shadows
      >
        <CameraSetup />

        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[8, 12, 6]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-6, 4, -4]} intensity={0.4} color="#c0d0ff" />
        <hemisphereLight args={['#ddeeff', '#8899aa', 0.5]} />

        {/* Environment for reflections */}
        <Environment preset="warehouse" />

        {/* Ground grid */}
        {showGrid && <Grid position={[0, -1.2, 0]} args={[20, 20]} cellColor="#94a3b8" sectionColor="#64748b" fadeDistance={18} fadeStrength={1} cellSize={0.5} sectionSize={2} />}

        {/* Model */}
        <Suspense fallback={null}>
          {modelUrl ? (
            <GltfModel url={modelUrl} wireframe={wireframe} key={modelUrl} />
          ) : (
            <PlaceholderAircraft wireframe={wireframe} />
          )}
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          makeDefault
        />
      </Canvas>

      {/* HUD overlay controls */}
      <div className="absolute top-3 left-3 flex gap-2 pointer-events-auto">
        <button
          onClick={() => setWireframe(w => !w)}
          className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all shadow-sm ${
            wireframe ? 'bg-foreground text-background border-foreground' : 'bg-white/90 text-foreground border-border hover:bg-white'
          }`}
        >
          Wireframe
        </button>
        <button
          onClick={() => setShowGrid(g => !g)}
          className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-all shadow-sm ${
            showGrid ? 'bg-foreground text-background border-foreground' : 'bg-white/90 text-foreground border-border hover:bg-white'
          }`}
        >
          Grid
        </button>
      </div>

      {/* Model status */}
      {!modelUrl && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 text-[12px] text-muted-foreground border border-border shadow-sm text-center">
            <span className="font-medium text-foreground">Demo model shown</span> — Click "Load 3D Model" to open your own .glb / .gltf file
          </div>
        </div>
      )}
    </div>
  )
}
