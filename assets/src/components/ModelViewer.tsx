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
  return (
    <div className="flex h-full w-full items-center justify-center bg-paper-2 p-6 text-center text-sm text-ink-3">
      <span>Visualizador 3D em manutenção</span>
    </div>
  )
}