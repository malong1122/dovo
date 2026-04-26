import { Suspense, use } from 'react'
import type { CityGeoJSON } from '@/types/map.d'
import { getNMGeoData } from '@/data/geoLoader'
import Bottom from '@/map/bottom'
import Cloud from '@/map/cloud'
import PvBase from './PvBase'
import PvMarkers from './PvMarkers'
import type { PvGeoJSON } from '../data/pvLoader'

const geoPromise = getNMGeoData()

interface PvSceneProps {
  pvData: PvGeoJSON | null
}

function PvSceneContent({ pvData }: PvSceneProps) {
  const geoData = use(geoPromise) as CityGeoJSON
  return (
    <>
      <Cloud />
      <PvBase data={geoData} />
      <Bottom />
      {pvData && <PvMarkers nmData={geoData} pvData={pvData} depth={6} />}
    </>
  )
}

export default function PvScene({ pvData }: PvSceneProps) {
  return (
    <Suspense fallback={null}>
      <PvSceneContent pvData={pvData} />
    </Suspense>
  )
}
