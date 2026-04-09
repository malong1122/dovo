import type { CityGeoJSON } from "@/types/map";

const NM_GEO_URL = new URL(
  "../../json/内蒙古自治区.geojson",
  import.meta.url
).href;

let promise: Promise<CityGeoJSON> | null = null;

export function getNMGeoData(): Promise<CityGeoJSON> {
  if (!promise) {
    promise = fetch(NM_GEO_URL).then((r) => {
      if (!r.ok) throw new Error(`GeoJSON fetch failed: ${r.status}`);
      return r.json();
    });
  }
  return promise;
}
