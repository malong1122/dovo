import { use, useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { geoMercator } from "d3-geo";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  Group,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { enterprises } from "@/data/enterprises";
import { useAppStore } from "@/stores";
import type { CityGeoJSON } from "@/types/map";
import loadTexture from "./loadTexture";
import ringUrl from "@/assets/guangquan01.png";
import glowUrl from "@/assets/huiguang.png";

const texturesPromise = Promise.all([
  loadTexture(ringUrl),
  loadTexture(glowUrl, (tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = tex.wrapT = RepeatWrapping;
  }),
]);

const typeColors = {
  cattle: {
    primary: new Color("#ffd98d"),
    secondary: new Color("#ea580c"),
    border: "#ff6a1f",
    text: "#ff6a1f",
  },
  sheep: {
    primary: new Color("#fff1b2"),
    secondary: new Color("#f59e0b"),
    border: "#ffb347",
    text: "#d28a16",
  },
  both: {
    primary: new Color("#fff5c8"),
    secondary: new Color("#f0a830"),
    border: "#ffd37a",
    text: "#d88d1b",
  },
};

interface MarkersProps {
  data: CityGeoJSON;
  depth: number;
}

function getBarHeight(scale: "large" | "medium" | "small") {
  if (scale === "large") return 18;
  if (scale === "medium") return 12;
  return 7;
}

export default function Markers({ data, depth }: MarkersProps) {
  const bar = useAppStore((s) => s.bar);
  const mode = useAppStore((s) => s.mode);
  const filterType = useAppStore((s) => s.filterType);
  const filterCategory = useAppStore((s) => s.filterCategory);
  const setSelected = useAppStore((s) => s.setSelectedEnterprise);
  const [ringTexture, glowTexture] = use(texturesPromise);
  const ringRefs = useRef<Group[]>([]);

  const projection = useMemo(() => {
    return geoMercator()
      .center(data.features[0].properties.centroid)
      .scale(600)
      .translate([0, 0]);
  }, [data]);

  const filteredEnterprises = useMemo(() => {
    return enterprises.filter((enterprise) => {
      if (filterType !== "all" && enterprise.type !== filterType) return false;
      if (filterCategory !== "all" && enterprise.category !== filterCategory) return false;
      return true;
    });
  }, [filterType, filterCategory]);

  useFrame((_, delta) => {
    ringRefs.current.forEach((ring, index) => {
      if (!ring) return;
      ring.rotation.z += delta * (index % 2 === 0 ? 0.8 : -0.55);
    });
  });

  return (
    <group visible={bar}>
      {filteredEnterprises.map((enterprise, index) => {
        const [x, y] = projection([enterprise.lng, enterprise.lat])!;
        const z = depth + 1;
        const barHeight = getBarHeight(enterprise.scale);
        const colors = typeColors[enterprise.type];
        const displayName = enterprise.name.replace(/股份有限公司|有限责任公司|有限公司/g, "").slice(0, 10);

        return (
          <group
            key={enterprise.id}
            position={[x, -y, z]}
            onClick={(event) => {
              event.stopPropagation();
              setSelected(enterprise);
            }}>
            <group ref={(node) => void (ringRefs.current[index] = node!)}>
              <mesh renderOrder={6} rotation-x={Math.PI / 2} raycast={() => null}>
                <planeGeometry args={[9, 9]} />
                <meshBasicMaterial
                  transparent
                  color={0xffffff}
                  map={ringTexture}
                  alphaMap={ringTexture}
                  opacity={0.95}
                  depthTest={false}
                  fog={false}
                  blending={AdditiveBlending}
                />
              </mesh>
            </group>

            <mesh position={[0, 0, barHeight / 2]} raycast={() => null}>
              <boxGeometry args={[0.9, 0.9, barHeight]} />
              <meshBasicMaterial
                transparent
                color="#ffffff"
                opacity={0.96}
                depthTest={false}
                fog={false}
                onBeforeCompile={(shader) => {
                  shader.uniforms = {
                    ...shader.uniforms,
                    uColor1: { value: colors.primary },
                    uColor2: { value: colors.secondary },
                    uSize: { value: barHeight },
                  };
                  shader.vertexShader = shader.vertexShader.replace(
                    "void main() {",
                    `
                    varying vec3 vPosition;
                    void main() {
                      vPosition = position;
                    `
                  );
                  shader.fragmentShader = shader.fragmentShader.replace(
                    "void main() {",
                    `
                    varying vec3 vPosition;
                    uniform vec3 uColor1;
                    uniform vec3 uColor2;
                    uniform float uSize;
                    void main() {
                    `
                  );
                  shader.fragmentShader = shader.fragmentShader.replace(
                    "#include <opaque_fragment>",
                    `
                    #ifdef OPAQUE
                    diffuseColor.a = 1.0;
                    #endif

                    #ifdef USE_TRANSMISSION
                    diffuseColor.a *= transmissionAlpha + 0.1;
                    #endif

                    vec3 gradient = mix(uColor1, uColor2, max(vPosition.z, 0.0) / uSize);
                    outgoingLight = outgoingLight * gradient;
                    gl_FragColor = vec4(outgoingLight, diffuseColor.a);
                    `
                  );
                }}
              />
            </mesh>

            <mesh position={[0, 0, barHeight / 2]} renderOrder={5} raycast={() => null}>
              <group rotation-x={Math.PI / 2}>
                {[0, 60, 120].map((deg) => (
                  <mesh key={deg} rotation-z={(Math.PI / 180) * deg}>
                    <planeGeometry args={[3.8, barHeight]} />
                    <meshBasicMaterial
                      transparent
                      color={colors.secondary}
                      map={glowTexture}
                      opacity={0.38}
                      depthWrite={false}
                      side={DoubleSide}
                      blending={AdditiveBlending}
                    />
                  </mesh>
                ))}
              </group>
            </mesh>

            {!mode && (
              <Html
                key={`${enterprise.id}-marker-label-show`}
                position={[0, 0, barHeight + 2.3]}
                center
                distanceFactor={85}
                zIndexRange={[500, 1000]}
                style={{ pointerEvents: "none" }}>
                <div
                  style={{
                    background: "rgba(255, 250, 244, 0.9)",
                    border: `1px solid ${colors.border}`,
                    color: colors.text,
                    fontSize: 10,
                    padding: "2px 5px",
                    borderRadius: 3,
                    whiteSpace: "nowrap",
                    maxWidth: 88,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                  }}>
                  {displayName}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
