import { Suspense, use } from "react";
import type { CityGeoJSON } from "@/types/map";
import { getNMGeoData } from "@/data/geoLoader";
import Base from "./base";
import Bottom from "./bottom";
import Cloud from "./cloud";

const geoPromise = getNMGeoData();

function SceneContent() {
  const geoData = use(geoPromise) as CityGeoJSON;
  return (
    <>
      <Cloud />
      <Base data={geoData} />
      <Bottom />
    </>
  );
}

export default function Scene() {
  return (
    <Suspense fallback={null}>
      <SceneContent />
    </Suspense>
  );
}
