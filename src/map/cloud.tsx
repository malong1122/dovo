import {
  createContext,
  use,
  useContext,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type RefObject,
} from "react";
import {
  REVISION,
  BufferAttribute,
  Color,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Quaternion,
  Vector3,
} from "three";
import {
  applyProps,
  useFrame,
  type ReactThreeFiber,
  type ThreeElements,
} from "@react-three/fiber";
import { useAppStore } from "@/stores";
import loadTexture from "./loadTexture";
import cloudUrl from "@/assets/cloud.png";

const cloudTexture = loadTexture(cloudUrl);

type CloudState = {
  uuid: string;
  index: number;
  segments: number;
  dist: number;
  matrix: Matrix4;
  bounds: Vector3;
  position: Vector3;
  volume: number;
  length?: number;
  ref?: RefObject<Group | null>;
  speed: number;
  growth: number;
  opacity: number;
  fade: number;
  density: number;
  rotation: number;
  rotationFactor: number;
  color: Color;
};

type CloudsProps = Omit<ThreeElements["group"], "ref"> & {
  ref?: React.Ref<Group>;
  limit?: number;
  range?: number;
  frustumCulled?: boolean;
};

type CloudProps = Omit<ThreeElements["group"], "ref"> & {
  ref?: React.Ref<Group>;
  seed?: number;
  segments?: number;
  bounds?: ReactThreeFiber.Vector3;
  concentrate?: "random" | "inside" | "outside";
  volume?: number;
  smallestVolume?: number;
  distribute?: (
    cloud: CloudState,
    index: number
  ) => { point: Vector3; volume?: number };
  growth?: number;
  speed?: number;
  fade?: number;
  opacity?: number;
  color?: ReactThreeFiber.Color;
};

const parentMatrix = new Matrix4();
const translation = new Vector3();
const rotation = new Quaternion();
const cameraPosition = new Vector3();
const cameraQuaternion = new Quaternion();
const scale = new Vector3();

function setUpdateRange(
  attribute: BufferAttribute,
  updateRange: { start: number; count: number }
) {
  attribute.updateRanges[0] = updateRange;
}

const cloudContext = createContext<MutableRefObject<CloudState[]>>(null!);

function Clouds({
  children,
  range,
  limit = 300,
  frustumCulled = false,
  ...props
}: CloudsProps) {
  const instance = useRef<InstancedMesh>(null!);
  const clouds = useRef<CloudState[]>([]);
  const opacities = useMemo(
    () => new Float32Array(Array.from({ length: limit }, () => 1)),
    [limit]
  );
  const colors = useMemo(
    () => new Float32Array(Array.from({ length: limit }, () => [1, 1, 1]).flat()),
    [limit]
  );
  const texture = use(cloudTexture);

  const quaternionAxis = new Quaternion();
  const forward = new Vector3(0, 0, 1);
  const position = new Vector3();

  useFrame((state, delta) => {
    parentMatrix.copy(instance.current.matrixWorld).invert();
    state.camera.matrixWorld.decompose(
      cameraPosition,
      cameraQuaternion,
      scale
    );

    for (let index = 0; index < clouds.current.length; index += 1) {
      const config = clouds.current[index];
      config.ref?.current?.matrixWorld.decompose(translation, rotation, scale);
      translation.add(
        position.copy(config.position).applyQuaternion(rotation).multiply(scale)
      );
      rotation
        .copy(cameraQuaternion)
        .multiply(
          quaternionAxis.setFromAxisAngle(
            forward,
            (config.rotation += delta * config.rotationFactor)
          )
        );
      scale.multiplyScalar(
        config.volume +
          ((1 + Math.sin(state.clock.elapsedTime * config.density * config.speed)) / 2) *
            config.growth
      );
      config.matrix.compose(translation, rotation, scale).premultiply(parentMatrix);
      config.dist = translation.distanceTo(cameraPosition);
    }

    clouds.current.sort((a, b) => b.dist - a.dist);

    for (let index = 0; index < clouds.current.length; index += 1) {
      const config = clouds.current[index];
      opacities[index] =
        config.opacity *
        (config.dist < config.fade - 1 ? config.dist / config.fade : 1);
      instance.current.setMatrixAt(index, config.matrix);
      instance.current.setColorAt(index, config.color);
    }

    instance.current.geometry.attributes.cloudOpacity.needsUpdate = true;
    instance.current.instanceMatrix.needsUpdate = true;
    if (instance.current.instanceColor) {
      instance.current.instanceColor.needsUpdate = true;
    }
  });

  useLayoutEffect(() => {
    const count = Math.min(
      limit,
      range !== undefined ? range : limit,
      clouds.current.length
    );
    instance.current.count = count;
    setUpdateRange(instance.current.instanceMatrix, {
      start: 0,
      count: count * 16,
    });
    if (instance.current.instanceColor) {
      setUpdateRange(instance.current.instanceColor, {
        start: 0,
        count: count * 3,
      });
    }
    setUpdateRange(
      instance.current.geometry.attributes.cloudOpacity as BufferAttribute,
      { start: 0, count }
    );
  });

  let imageBounds: [number, number] = [
    texture.image.width ?? 1,
    texture.image.height ?? 1,
  ];
  const max = Math.max(imageBounds[0], imageBounds[1]);
  imageBounds = [imageBounds[0] / max, imageBounds[1] / max];

  return (
    <group {...props}>
      <cloudContext.Provider value={clouds}>
        {children}
        <instancedMesh
          matrixAutoUpdate={false}
          ref={instance}
          args={[undefined, undefined, limit]}
          frustumCulled={frustumCulled}>
          <instancedBufferAttribute
            usage={DynamicDrawUsage}
            attach="instanceColor"
            args={[colors, 3]}
          />
          <planeGeometry args={[...imageBounds]}>
            <instancedBufferAttribute
              usage={DynamicDrawUsage}
              attach="attributes-cloudOpacity"
              args={[opacities, 1]}
            />
          </planeGeometry>
          <meshLambertMaterial
            transparent
            map={texture}
            color="#ffffff"
            depthWrite={false}
            onBeforeCompile={(shader) => {
              const opaqueFragment =
                parseInt(REVISION.replace(/\D+/g, ""), 10) >= 154
                  ? "opaque_fragment"
                  : "output_fragment";
              shader.vertexShader =
                `attribute float cloudOpacity;
varying float vOpacity;
` +
                shader.vertexShader.replace(
                  "#include <fog_vertex>",
                  `#include <fog_vertex>
vOpacity = cloudOpacity;
`
                );
              shader.fragmentShader =
                `varying float vOpacity;
` +
                shader.fragmentShader.replace(
                  `#include <${opaqueFragment}>`,
                  `#include <${opaqueFragment}>
gl_FragColor = vec4(outgoingLight, diffuseColor.a * vOpacity);
`
                );
            }}
          />
        </instancedMesh>
      </cloudContext.Provider>
    </group>
  );
}

function CloudInstance({
  opacity = 1,
  speed = 0,
  bounds = [5, 1, 1],
  segments = 20,
  color = "#ffffff",
  fade = 10,
  volume = 6,
  smallestVolume = 0.25,
  distribute,
  growth = 4,
  concentrate = "inside",
  seed = Math.random(),
  ref: forwardRef,
  ...props
}: CloudProps) {
  function random() {
    const x = Math.sin(seedValue++) * 10000;
    return x - Math.floor(x);
  }

  let seedValue = seed;
  const parent = useContext(cloudContext);
  const ref = useRef<Group>(null!);
  const uuid = useId();

  const clouds: CloudState[] = useMemo(
    () =>
      [...new Array(segments)].map((_, index) => ({
        segments,
        bounds: new Vector3(1, 1, 1),
        position: new Vector3(),
        uuid,
        index,
        ref,
        dist: 0,
        matrix: new Matrix4(),
        color: new Color(),
        rotation: index * (Math.PI / segments),
        volume: 1,
        speed,
        growth,
        opacity,
        fade,
        density: 1,
        rotationFactor: 0,
      })),
    [fade, growth, opacity, segments, speed, uuid]
  );

  useLayoutEffect(() => {
    clouds.forEach((cloud, index) => {
      applyProps(cloud as never, {
        volume,
        color,
        speed,
        growth,
        opacity,
        fade,
        bounds,
        density: Math.max(0.5, random()),
        rotationFactor: Math.max(0.2, 0.5 * random()) * speed,
      });

      const distributed = distribute?.(cloud, index);

      if (distributed || segments > 1) {
        cloud.position.copy(cloud.bounds).multiply(
          distributed?.point ??
            ({
              x: random() * 2 - 1,
              y: random() * 2 - 1,
              z: random() * 2 - 1,
            } as Vector3)
        );
      }

      const xDiff = Math.abs(cloud.position.x);
      const yDiff = Math.abs(cloud.position.y);
      const zDiff = Math.abs(cloud.position.z);
      const max = Math.max(xDiff, yDiff, zDiff);
      cloud.length = 1;
      if (xDiff === max) cloud.length -= xDiff / cloud.bounds.x;
      if (yDiff === max) cloud.length -= yDiff / cloud.bounds.y;
      if (zDiff === max) cloud.length -= zDiff / cloud.bounds.z;
      cloud.volume =
        (distributed?.volume !== undefined
          ? distributed.volume
          : Math.max(
              Math.max(0, smallestVolume),
              concentrate === "random"
                ? random()
                : concentrate === "inside"
                  ? cloud.length
                  : 1 - cloud.length
            )) * volume;
    });
  }, [
    bounds,
    clouds,
    color,
    concentrate,
    distribute,
    fade,
    growth,
    opacity,
    segments,
    smallestVolume,
    speed,
    volume,
  ]);

  useLayoutEffect(() => {
    const currentClouds = clouds;
    parent.current = [...parent.current, ...currentClouds];
    return () => {
      parent.current = parent.current.filter((item) => item.uuid !== uuid);
    };
  }, [clouds, parent, uuid]);

  useImperativeHandle(forwardRef, () => ref.current, []);

  return <group ref={ref} {...props} />;
}

function CloudNode(props: CloudProps) {
  const parent = useContext(cloudContext);
  if (parent) return <CloudInstance {...props} />;
  return (
    <Clouds>
      <CloudInstance {...props} />
    </Clouds>
  );
}

export default function CloudGroup() {
  const rootRef = useRef<Group>(null!);
  const leftCloudRef = useRef<Group>(null!);
  const cloud = useAppStore((s) => s.cloud);

  useFrame((state, delta) => {
    if (!rootRef.current || !leftCloudRef.current) return;
    rootRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.85) / 4.5;
    rootRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) / 9;
    leftCloudRef.current.rotation.y -= delta / 2.6;
  });

  return (
    <Clouds ref={rootRef} visible={cloud}>
      <CloudNode
        ref={leftCloudRef}
        bounds={[58, 12, 14]}
        position={[108, 44, 14]}
        volume={52}
        opacity={0.55}
        fade={220}
        speed={0.85}
        growth={4.4}
        segments={34}
        color="#ffffff"
      />
      <CloudNode
        bounds={[54, 11, 13]}
        position={[-74, 40, 58]}
        volume={48}
        opacity={0.5}
        fade={220}
        speed={0.72}
        growth={4}
        segments={30}
        color="#f8fbff"
      />
      <CloudNode
        bounds={[44, 10, 10]}
        position={[16, 50, -12]}
        volume={42}
        opacity={0.42}
        fade={220}
        speed={0.6}
        growth={3.5}
        segments={24}
        color="#f3f7fb"
      />
    </Clouds>
  );
}
