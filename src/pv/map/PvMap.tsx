import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, MapControls } from '@react-three/drei'
import Lights from '@/map/lights'
import PvScene from './PvScene'
import { getPvData, type PvGeoJSON } from '../data/pvLoader'

const CanvasWrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`

export default function PvMap() {
  const [pvData, setPvData] = useState<PvGeoJSON | null>(null)

  useEffect(() => {
    getPvData().then(setPvData).catch(console.error)
  }, [])

  return (
    <CanvasWrapper>
      <Canvas
        flat
        shadows
        camera={{ position: [-50, 125, 250], fov: 50, far: 2000, near: 1 }}
        dpr={[1, 2]}>
        <color attach="background" args={['#fff5e8']} />
        <fog attach="fog" args={['#fff5e8', 420, 880]} />
        <Lights />
        <PvScene pvData={pvData} />
        <ContactShadows
          opacity={0.4}
          scale={300}
          blur={0.5}
          resolution={256}
          color="#000000"
        />
        <MapControls
          zoomSpeed={0.6}
          minDistance={30}
          maxDistance={600}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </CanvasWrapper>
  )
}
