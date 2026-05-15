import type { PvFeature } from './pvLoader'

export function cityCentroid(features: PvFeature[]): Map<string, [number, number]> {
  const acc = new Map<string, { sum: [number, number]; n: number }>()
  for (const f of features) {
    const city = f.properties.city
    const [lng, lat] = f.properties.centroid
    const e = acc.get(city)
    if (e) { e.sum[0] += lng; e.sum[1] += lat; e.n++ }
    else acc.set(city, { sum: [lng, lat], n: 1 })
  }
  const out = new Map<string, [number, number]>()
  for (const [city, { sum, n }] of acc) out.set(city, [sum[0] / n, sum[1] / n])
  return out
}

export interface CityStats {
  city: string
  village_count: number
  station_count: number
  total_build_kw: number
  total_confirm_kw: number
  poor_village_count: number
  confirmed_count: number
}

export function aggregateByCity(features: PvFeature[]): CityStats[] {
  const map = new Map<string, CityStats>()
  for (const f of features) {
    const p = f.properties
    if (!p.city) continue
    const existing = map.get(p.city)
    if (existing) {
      existing.village_count += 1
      existing.station_count += p.station_count
      existing.total_build_kw += p.total_build_kw
      existing.total_confirm_kw += p.total_confirm_kw
      if (p.is_poor === '是') existing.poor_village_count += 1
      existing.confirmed_count += p.stations.filter((s) => s.is_confirmed === '是').length
    } else {
      map.set(p.city, {
        city: p.city,
        village_count: 1,
        station_count: p.station_count,
        total_build_kw: p.total_build_kw,
        total_confirm_kw: p.total_confirm_kw,
        poor_village_count: p.is_poor === '是' ? 1 : 0,
        confirmed_count: p.stations.filter((s) => s.is_confirmed === '是').length,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.total_build_kw - a.total_build_kw)
}

export function globalStats(features: PvFeature[]) {
  return {
    village_count: new Set(features.map((f) => `${f.properties.county}-${f.properties.village}`)).size,
    station_count: features.reduce((s, f) => s + f.properties.station_count, 0),
    total_build_mw: features.reduce((s, f) => s + f.properties.total_build_kw, 0) / 1000,
    total_confirm_mw: features.reduce((s, f) => s + f.properties.total_confirm_kw, 0) / 1000,
    poor_village_count: features.filter((f) => f.properties.is_poor === '是').length,
    village_type_count: features.reduce(
      (acc, f) => {
        for (const s of f.properties.stations) {
          if (s.station_type === '村级电站') acc.village += 1
          else if (s.station_type === '联村电站') acc.joint += 1
          else acc.central += 1
        }
        return acc
      },
      { village: 0, joint: 0, central: 0 }
    ),
  }
}
