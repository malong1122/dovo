import { Suspense, use, useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { geoMercator } from 'd3-geo'
import { gsap } from 'gsap'
import type { CityGeoJSON } from '@/types/map.d'
import { getNMGeoData } from '@/data/geoLoader'
import Bottom from '@/map/bottom'
import Cloud from '@/map/cloud'
import PvBase from './PvBase'
import PvCityBars from './PvCityBars'
import PvMarkers from './PvMarkers'
import { getPvData } from '../data/pvLoader'
import { cityCentroid } from '../data/pvStats'
import { usePvStore } from '../pvStore'

const geoPromise = getNMGeoData()
const pvPromise = getPvData()

const OVERVIEW_CAM = { x: 30, y: 100, z: 180 }

function PvSceneContent() {
  const geoData = use(geoPromise) as CityGeoJSON
  const pvData = use(pvPromise)
  const camera = useThree((s) => s.camera)

  const { projection, centroidMap } = useMemo(() => {
    const proj = geoMercator()
      .center(geoData.features[0].properties.centroid)
      .scale(600)
      .translate([0, 0])
    return { projection: proj, centroidMap: cityCentroid(pvData.features) }
  }, [geoData, pvData])

  useEffect(() => {
    return usePvStore.subscribe(
      (s) => s.selectedCity,
      (city) => {
        if (city) {
          const lngLat = centroidMap.get(city)
          if (!lngLat) return
          const proj = projection(lngLat)
          if (!proj) return
          const [px, py] = proj
          gsap.to(camera.position, { x: px + 10, y: 55, z: py + 110, duration: 1.5, ease: 'circ.out' })
        } else {
          gsap.to(camera.position, { ...OVERVIEW_CAM, duration: 1.5, ease: 'circ.out' })
        }
      }
    )
  }, [centroidMap, projection, camera])

  return (
    <>
      <Cloud />
      <PvBase data={geoData} />
      <Bottom />
      <PvCityBars nmData={geoData} pvData={pvData} depth={6} />
      <PvMarkers nmData={geoData} pvData={pvData} depth={6} />
    </>
  )
}

export default function PvScene() {
  return (
    <Suspense fallback={null}>
      <PvSceneContent />
    </Suspense>
  )
}
