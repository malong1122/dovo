export interface PvStation {
  station_id: string
  station_name: string
  station_type: string
  build_scale: number
  confirm_scale: number
  is_poor: string
  is_confirmed: string
}

export interface PvVillageProps {
  village: string
  town: string
  county: string
  city: string
  centroid: [number, number]
  station_count: number
  total_build_kw: number
  total_confirm_kw: number
  is_poor: string
  stations: PvStation[]
}

export interface PvFeature {
  type: 'Feature'
  geometry: { type: string; coordinates: unknown }
  properties: PvVillageProps
}

export interface PvGeoJSON {
  type: 'FeatureCollection'
  features: PvFeature[]
}

let promise: Promise<PvGeoJSON> | null = null

export function getPvData(): Promise<PvGeoJSON> {
  if (!promise) {
    promise = fetch('/pv_points.json').then((r) => {
      if (!r.ok) throw new Error(`PV points fetch failed: ${r.status}`)
      return r.json() as Promise<PvVillageProps[]>
    }).then((arr) => ({
      type: 'FeatureCollection' as const,
      features: arr.map((p) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point', coordinates: p.centroid },
        properties: p,
      })),
    }))
  }
  return promise
}
