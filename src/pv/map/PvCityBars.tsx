import { use, useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { geoMercator } from 'd3-geo'
import { AdditiveBlending, Color, DoubleSide, Group } from 'three'
import type { CityGeoJSON } from '@/types/map.d'
import type { PvGeoJSON } from '../data/pvLoader'
import { aggregateByCity, cityCentroid } from '../data/pvStats'
import { usePvStore } from '../pvStore'
import { pvTexturesPromise } from './pvTextures'

const BAR_PRIMARY = new Color('#ffe082')
const BAR_SECONDARY = new Color('#ff8f00')

interface PvCityBarsProps {
  nmData: CityGeoJSON
  pvData: PvGeoJSON
  depth: number
}

interface CityBarProps {
  position: [number, number, number]
  h: number
  name: string
  onSelect: () => void
  ringTexture: ReturnType<typeof use<ReturnType<typeof pvTexturesPromise>>>[0]
  glowTexture: ReturnType<typeof use<ReturnType<typeof pvTexturesPromise>>>[1]
}

function CityBar({ position, h, name, onSelect, ringTexture, glowTexture }: CityBarProps) {
  const [hovered, setHovered] = useState(false)
  const ringRef = useRef<Group>(null!)

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.y += delta * (hovered ? 1.4 : 0.6)
  })

  return (
    <group
      position={position}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
    >
      {/* 命中区 */}
      <mesh position={[0, h / 2, 0]} visible={false}>
        <cylinderGeometry args={[6, 6, h + 10, 8]} />
        <meshBasicMaterial />
      </mesh>

      {/* 底部光圈 */}
      <group ref={ringRef}>
        <mesh renderOrder={6} rotation-x={-Math.PI / 2} raycast={() => null}>
          <planeGeometry args={[hovered ? 14 : 10, hovered ? 14 : 10]} />
          <meshBasicMaterial
            transparent
            color={0xffffff}
            map={ringTexture}
            alphaMap={ringTexture}
            opacity={hovered ? 1.0 : 0.8}
            depthTest={false}
            fog={false}
            blending={AdditiveBlending}
          />
        </mesh>
      </group>

      {/* 渐变柱体 */}
      <mesh position={[0, h / 2, 0]} raycast={() => null}>
        <boxGeometry args={[1.4, h, 1.4]} />
        <meshBasicMaterial
          transparent
          color="#ffffff"
          opacity={0.96}
          depthTest={false}
          fog={false}
          onBeforeCompile={(shader) => {
            shader.uniforms = {
              ...shader.uniforms,
              uColor1: { value: BAR_PRIMARY },
              uColor2: { value: BAR_SECONDARY },
              uSize: { value: h },
            }
            shader.vertexShader = shader.vertexShader.replace(
              'void main() {',
              `varying vec3 vPosition;
              void main() {
                vPosition = position;`
            )
            shader.fragmentShader = shader.fragmentShader.replace(
              'void main() {',
              `varying vec3 vPosition;
              uniform vec3 uColor1;
              uniform vec3 uColor2;
              uniform float uSize;
              void main() {`
            )
            shader.fragmentShader = shader.fragmentShader.replace(
              '#include <opaque_fragment>',
              `#ifdef OPAQUE
              diffuseColor.a = 1.0;
              #endif
              #ifdef USE_TRANSMISSION
              diffuseColor.a *= transmissionAlpha + 0.1;
              #endif
              vec3 gradient = mix(uColor1, uColor2, max(vPosition.y + uSize * 0.5, 0.0) / uSize);
              outgoingLight = outgoingLight * gradient;
              gl_FragColor = vec4(outgoingLight, diffuseColor.a);`
            )
          }}
        />
      </mesh>

      {/* 辉光 */}
      <group position={[0, h / 2, 0]} renderOrder={5}>
        {[0, 60, 120].map((deg) => (
          <mesh key={deg} rotation-y={(Math.PI / 180) * deg} raycast={() => null}>
            <planeGeometry args={[5, h]} />
            <meshBasicMaterial
              transparent
              color={BAR_SECONDARY}
              map={glowTexture}
              opacity={hovered ? 0.5 : 0.32}
              depthWrite={false}
              side={DoubleSide}
              blending={AdditiveBlending}
            />
          </mesh>
        ))}
      </group>

      {/* 盟市名称标签（常驻） */}
      <Html
        position={[0, h + 3, 0]}
        center
        distanceFactor={85}
        zIndexRange={[500, 1000]}
        style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(255,248,220,0.92)',
          border: `1px solid ${hovered ? '#f59e0b' : 'rgba(245,158,11,0.45)'}`,
          color: '#92400e',
          fontSize: hovered ? 11 : 10,
          fontWeight: hovered ? 700 : 400,
          padding: '2px 6px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
          boxShadow: hovered ? '0 0 10px rgba(245,158,11,0.4)' : 'none',
        }}>
          {name}
        </div>
      </Html>
    </group>
  )
}

export default function PvCityBars({ nmData, pvData, depth }: PvCityBarsProps) {
  const [ringTexture, glowTexture] = use(pvTexturesPromise)
  const selectedCity = usePvStore((s) => s.selectedCity)
  const setSelectedCity = usePvStore((s) => s.setSelectedCity)

  const projection = useMemo(() => {
    return geoMercator()
      .center(nmData.features[0].properties.centroid)
      .scale(600)
      .translate([0, 0])
  }, [nmData])

  const { cityStats, centroidMap, maxKw } = useMemo(() => {
    const stats = aggregateByCity(pvData.features)
    const centroids = cityCentroid(pvData.features)
    const max = Math.max(...stats.map((c) => c.total_build_kw))
    return { cityStats: stats, centroidMap: centroids, maxKw: max }
  }, [pvData])

  if (selectedCity !== null) return null

  return (
    <group>
      {cityStats.map((city) => {
        const lngLat = centroidMap.get(city.city)
        if (!lngLat) return null
        const proj = projection(lngLat)
        if (!proj) return null
        const [x, y] = proj
        const h = Math.max(5, (city.total_build_kw / maxKw) * 28)

        return (
          <CityBar
            key={city.city}
            position={[x + 10, depth + 1, y]}
            h={h}
            name={city.city}
            onSelect={() => setSelectedCity(city.city)}
            ringTexture={ringTexture}
            glowTexture={glowTexture}
          />
        )
      })}
    </group>
  )
}
