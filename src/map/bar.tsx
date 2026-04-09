import { use, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  DoubleSide,
  InstancedMesh,
  Object3D,
  RepeatWrapping,
  SRGBColorSpace,
  type Mesh,
} from "three";
import { useAppStore } from "@/stores";
import loadTexture from "./loadTexture";
import ringUrl from "@/assets/guangquan01.png";
import glowUrl from "@/assets/huiguang.png";

export interface CityBarProps {
  position?: ThreeElements["group"]["position"];
  value?: number;
  uColor1?: Color;
  uColor2?: Color;
  dir?: "x" | "y" | "z";
  factor?: number;
  max?: number;
  children?: React.ReactNode | ((barHeight: number) => React.ReactNode);
}

const textures = Promise.all([
  loadTexture(ringUrl),
  loadTexture(glowUrl, (tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.wrapS = tex.wrapT = RepeatWrapping;
  }),
]);

export default function Bar(props: CityBarProps) {
  const {
    position,
    value = 100,
    children,
    uColor1 = new Color(0xffffff),
    uColor2 = new Color(0xdbeafe),
    dir = "y",
    factor = 5,
    max = 60,
  } = props;
  const dirMap = { x: 1.0, y: 2.0, z: 3.0 };

  const ringRef = useRef<Mesh>(null!);
  const glowRef = useRef<InstancedMesh>(null!);
  const bar = useAppStore((s) => s.bar);
  const [ringTexture, glowTexture] = use(textures);

  const barHeight = useMemo(() => {
    return Math.max(0.6, 4.0 * factor * (value / max));
  }, [factor, max, value]);

  useFrame((_, delta) => {
    ringRef.current.rotation.z += delta + 0.02;
  });

  useEffect(() => {
    const rotations = [0, 60, 120];
    const object3D = new Object3D();

    rotations.forEach((deg, i) => {
      object3D.rotation.set(Math.PI / 2, (Math.PI / 180) * deg, 0);
      object3D.updateMatrix();
      glowRef.current.setMatrixAt(i, object3D.matrix);
    });

    glowRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <group visible={bar} position={position}>
      <instancedMesh
        ref={glowRef}
        matrixAutoUpdate={false}
        args={[undefined, undefined, 3]}
        renderOrder={18}
        position={[0, 0, barHeight / 2]}
        rotation-x={Math.PI / 2}
        frustumCulled={false}
        raycast={() => null}>
        <planeGeometry args={[3.5, barHeight]} />
        <meshBasicMaterial
          transparent
          color={uColor2}
          map={glowTexture}
          opacity={0.4}
          depthWrite={false}
          depthTest={false}
          side={DoubleSide}
          blending={AdditiveBlending}
        />
      </instancedMesh>

      <mesh
        renderOrder={19}
        position={[0, 0, barHeight / 2]}
        frustumCulled={false}
        raycast={() => null}>
        <boxGeometry args={[0.1 * factor, 0.1 * factor, barHeight]} />
        <meshBasicMaterial
          color="#ffffff"
          depthTest={false}
          depthWrite={false}
          fog={false}
          toneMapped={false}
          onBeforeCompile={(shader) => {
            shader.uniforms = {
              ...shader.uniforms,
              uColor1: { value: uColor1 },
              uColor2: { value: uColor2 },
              uDir: { value: dirMap[dir] },
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
                uniform float uDir;
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

              vec3 gradient = vec3(0.0);
              if (uDir == 1.0) {
                gradient = mix(uColor1, uColor2, vPosition.x / uSize);
              } else if (uDir == 2.0) {
                gradient = mix(uColor1, uColor2, vPosition.z / uSize);
              } else {
                gradient = mix(uColor1, uColor2, vPosition.y / uSize);
              }
              outgoingLight = outgoingLight * gradient;
              gl_FragColor = vec4(outgoingLight, 1.0);
              `
            );
          }}
        />
      </mesh>

      <mesh
        renderOrder={20}
        ref={ringRef}
        frustumCulled={false}
        raycast={() => null}>
        <planeGeometry args={[5, 5]} />
        <meshBasicMaterial
          transparent
          color={0xffffff}
          map={ringTexture}
          alphaMap={ringTexture}
          opacity={1}
          depthTest={false}
          depthWrite={false}
          fog={false}
          blending={AdditiveBlending}
        />
      </mesh>
      {typeof children === "function" ? children(barHeight) : children}
    </group>
  );
}
