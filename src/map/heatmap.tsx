import { useEffect, useMemo, useRef } from "react";
import type { GeoProjection } from "d3-geo";
import type { ThreeElements } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  type Mesh,
  type PlaneGeometry,
  type ShaderMaterial,
} from "three";
// @ts-ignore
import heatmapJs from "keli-heatmap.js";
import { enterprises } from "@/data/enterprises";
import { useAppStore } from "@/stores";

interface HeatmapProps extends Omit<ThreeElements["group"], "visible"> {
  projection: GeoProjection;
  size?: number;
}

export default function Heatmap(props: HeatmapProps) {
  const { projection, size = 520, ...args } = props;
  const refMesh = useRef<Mesh<PlaneGeometry, ShaderMaterial>>(null!);
  const heat = useAppStore((s) => s.heat);

  const points = useMemo(() => {
    return enterprises.map((enterprise) => {
      const [x = 0, y = 0] = projection([enterprise.lng, enterprise.lat]) ?? [];
      return {
        x: Math.floor(x + size / 2),
        y: Math.floor(y + size / 2),
        value: Math.round(enterprise.annualRevenue / 1200 + enterprise.annualOutput * 20),
      };
    });
  }, [projection, size]);

  useEffect(() => {
    const radius = 20;
    const heatmapContainer = document.createElement("div");
    heatmapContainer.style.cssText = "position:absolute;top:-9999px;left:-9999px;";
    document.body.appendChild(heatmapContainer);

    const heatmap = heatmapJs.create({
      container: heatmapContainer,
      gradient: {
        0.35: "#1fc2e1",
        0.5: "#31d46c",
        0.68: "#f0d92d",
        0.82: "#ff9f2d",
        1.0: "#ff2a00",
      },
      blur: 1,
      radius,
      maxOpacity: 1,
      width: size,
      height: size,
    });

    const greymap = heatmapJs.create({
      container: heatmapContainer,
      gradient: { 0.0: "black", 1.0: "white" },
      radius,
      maxOpacity: 1,
      width: size,
      height: size,
    });

    heatmap.setData({ max: 220, min: 0, data: points });
    greymap.setData({ max: 220, min: 0, data: points });

    const colorTexture = new CanvasTexture(heatmap._renderer.canvas);
    colorTexture.needsUpdate = true;
    const greyTexture = new CanvasTexture(greymap._renderer.canvas);
    greyTexture.needsUpdate = true;
    refMesh.current.material.uniforms.heatMap.value = colorTexture;
    refMesh.current.material.uniforms.greyMap.value = greyTexture;

    return () => {
      heatmap._renderer.canvas.remove();
      greymap._renderer.canvas.remove();
      document.body.removeChild(heatmapContainer);
    };
  }, [points, size]);

  return (
    <group visible={heat} {...args}>
      <mesh ref={refMesh} renderOrder={8} frustumCulled={false}>
        <planeGeometry args={[size, size, 300, 300]} />
        <shaderMaterial
          transparent
          side={DoubleSide}
          depthTest={false}
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
          vertexShader={`
            varying vec2 vUv;
            uniform float z_scale;
            uniform sampler2D greyMap;
            void main() {
              vUv = uv;
              vec4 frgColor = texture2D(greyMap, uv);
              float height = z_scale * frgColor.a;
              vec3 transformed = vec3(position.x, position.y, height);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
            }
          `}
          fragmentShader={`
            precision highp float;
            varying vec2 vUv;
            uniform sampler2D heatMap;
            uniform vec3 u_color;
            uniform float u_opacity;
            void main() {
              gl_FragColor = vec4(u_color, u_opacity) * texture2D(heatMap, vUv);
            }
          `}
          uniforms={{
            heatMap: { value: undefined },
            greyMap: { value: undefined },
            z_scale: { value: 7.2 },
            u_color: { value: new Color("#fff4e8") },
            u_opacity: { value: 1.0 },
          }}
        />
      </mesh>
    </group>
  );
}
