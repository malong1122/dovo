import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { geoMercator } from 'd3-geo'
import type { CityGeoJSON } from '@/types/map.d'
import type { PvGeoJSON } from '../data/pvLoader'
import { usePvStore } from '../pvStore'

const TYPE_COLORS: Record<string, string> = {
  '村级电站': '#f59e0b',
  '联村电站': '#f97316',
}
function typeColor(t: string) {
  return TYPE_COLORS[t] ?? '#2299ff'
}

interface PvMarkersProps {
  nmData: CityGeoJSON
  pvData: PvGeoJSON
  depth: number
}

export default function PvMarkers({ nmData, pvData, depth }: PvMarkersProps) {
  const setSelected = usePvStore((s) => s.setSelectedVillage)

  const projection = useMemo(() => {
    return geoMercator()
      .center(nmData.features[0].properties.centroid)
      .scale(600)
      .translate([0, 0])
  }, [nmData])

  console.log('[PvMarkers] features:', pvData.features.length)

  return (
    <group>
      {pvData.features.map((feature, index) => {
        const [lng, lat] = feature.properties.centroid
        const proj = projection([lng, lat])
        if (!proj) return null
        const [x, y] = proj
        const color = typeColor(feature.properties.stations[0]?.station_type ?? '')
        const kw = feature.properties.total_confirm_kw || feature.properties.total_build_kw
        const h = kw >= 3000 ? 14 : kw >= 1000 ? 9 : 5

        // Base group: rotation=[-PI/2,0,0] position-x=10
        // local [x, y, z] → world [x+10, z, -y]
        // so world position = [x+10, depth+1, y]
        return (
          <group key={index} position={[x + 10, depth + 1, y]} onClick={(e) => {
            e.stopPropagation()
            setSelected(feature.properties)
          }}>
            <mesh>
              <cylinderGeometry args={[0.4, 0.4, h, 6]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <Html
              position={[0, h + 1, 0]}
              center
              distanceFactor={80}
              zIndexRange={[0, 99]}
              style={{ pointerEvents: 'none' }}>
              <div style={{
                background: 'rgba(255,245,232,0.92)',
                border: `1px solid ${color}`,
                color: '#78350f',
                fontSize: 9,
                padding: '1px 4px',
                borderRadius: 2,
                whiteSpace: 'nowrap',
              }}>
                {feature.properties.village}
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
