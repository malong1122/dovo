import { use, useLayoutEffect, useMemo, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { geoMercator } from 'd3-geo'
import { gsap } from 'gsap'
import {
  Box2,
  ClampToEdgeWrapping,
  LineSegments,
  Mesh,
  SRGBColorSpace,
  Vector2,
  type Group,
} from 'three'
import type { CityGeoJSON } from '@/types/map.d'
import { usePvStore } from '../pvStore'
import loadTexture from '@/map/loadTexture'
import PvCity, { type PvCityProps } from './PvCity'

import nmSatellite from '@/assets/nm_satellite.png'
import nmNormalMap from '@/assets/nm_normal_map.png'

type RegionPolygons = Vector2[][][]

const MAP_TEXTURE_REPEAT = new Vector2(0.63, 0.44)
const MAP_TEXTURE_OFFSET = new Vector2(0.23, 0.228)
const MAP_TEXTURE_CENTER = new Vector2(0.5, 0.5)
const MAP_TEXTURE_ROTATION = -0.005

const texturesPromise = Promise.all([
  loadTexture(nmSatellite, (tex) => {
    tex.wrapS = tex.wrapT = ClampToEdgeWrapping
    tex.colorSpace = SRGBColorSpace
    tex.repeat.copy(MAP_TEXTURE_REPEAT)
    tex.offset.copy(MAP_TEXTURE_OFFSET)
    tex.center.copy(MAP_TEXTURE_CENTER)
    tex.rotation = MAP_TEXTURE_ROTATION
  }),
  loadTexture(nmNormalMap, (tex) => {
    tex.wrapS = tex.wrapT = ClampToEdgeWrapping
    tex.repeat.copy(MAP_TEXTURE_REPEAT)
    tex.offset.copy(MAP_TEXTURE_OFFSET)
    tex.center.copy(MAP_TEXTURE_CENTER)
    tex.rotation = MAP_TEXTURE_ROTATION
  }),
])

interface PvBaseProps {
  depth?: number
  data: CityGeoJSON
}

export default function PvBase({ data, depth = 6 }: PvBaseProps) {
  const groupRef = useRef<Group>(null!)
  const camera = useThree((state) => state.camera)
  const [mapTexture, normalTexture] = use(texturesPromise)

  const projection = useMemo(() => {
    const centroid = data.features[0].properties.centroid
    return geoMercator().center(centroid).scale(600).translate([0, 0])
  }, [data])

  const { regions, bbox } = useMemo(() => {
    const regions: PvCityProps['data'][] = []
    const bbox = new Box2()

    const toV2 = (coord: number[]) => {
      const [x, y] = projection(coord as [number, number])!
      const projected = new Vector2(x, -y)
      bbox.expandByPoint(projected)
      return projected
    }

    data.features.forEach((feature) => {
      const polygons: RegionPolygons =
        feature.geometry.type === 'Polygon'
          ? [feature.geometry.coordinates.map<Vector2[]>((ring) => ring.map(toV2))]
          : feature.geometry.coordinates.map<Vector2[][]>((polygon) =>
              polygon.map<Vector2[]>((ring) => ring.map(toV2))
            )

      const [x, y] = projection(
        feature.properties.center ?? feature.properties.centroid
      )!

      regions.push({
        city: feature.properties.name,
        cityId: [x, -y, depth + 0.1],
        polygons,
      })
    })

    return { regions, bbox }
  }, [projection, data, depth])

  useLayoutEffect(() => {
    if (!groupRef.current) return
    const tl = gsap.timeline({
      onComplete: () => {
        usePvStore.setState({ mapPlayComplete: true })
      },
    })
    tl.to(camera.position, { x: 30, y: 100, z: 180, duration: 2.5, ease: 'circ.out' })
    tl.to(
      groupRef.current.scale,
      { x: 1, y: 1, z: 1, duration: 1.5, ease: 'circ.out' },
      1.5
    )
    groupRef.current.traverse((obj) => {
      if (obj instanceof Mesh || obj instanceof LineSegments) {
        tl.to(obj.material, { opacity: 1, duration: 1.5, ease: 'circ.out' }, 1.5)
      }
    })
    return () => { tl.kill() }
  }, [camera])

  return (
    <group ref={groupRef} rotation={[-Math.PI / 2, 0, 0]} scale-z={0.01} position-x={10}>
      {regions.map((region, idx) => (
        <PvCity
          key={idx}
          depth={depth}
          bbox={bbox}
          data={region}
          map={mapTexture}
          normalMap={normalTexture}
        />
      ))}
    </group>
  )
}
