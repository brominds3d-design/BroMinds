import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'
import { Suspense } from 'react'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  // Casting para 'any' resolve o aviso do JSX intrínseco do Three
  const Primitive = 'primitive' as any
  return <Primitive object={scene} />
}

export function ModelViewer({ model }: { model: string }) {
  // Casting dos elementos de luz para evitar conflitos de tipos JSX
  const AmbientLight = 'ambientLight' as any
  const DirectionalLight = 'directionalLight' as any

  return (
    <div className="h-full w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.2, 2.5], fov: 45 }}>
        <AmbientLight intensity={0.8} />
        <DirectionalLight position={[5, 10, 5]} intensity={1.2} />
        <DirectionalLight position={[-5, 5, -5]} intensity={0.4} />
        <Suspense fallback={null}>
          <Center>
            <Model url={model} />
          </Center>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={true} />
      </Canvas>
    </div>
  )
}