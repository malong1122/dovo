import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  Shape,
  ShapeGeometry,
  Vector3,
  type Box2,
  type Group,
  type MeshStandardMaterialProperties,
  type Vector2,
} from "three";
import { cityStats } from "@/data/enterprises";
import Bar from "./bar";
import Label from "./label";
import ShapeMesh from "./shape";
import Tooltip from "./tooltip";

export interface CityProps {
  map?: MeshStandardMaterialProperties["map"];
  normalMap?: MeshStandardMaterialProperties["normalMap"];
  bbox: Box2;
  depth: number;
  data: {
    city: string;
    cityId: [x: number, y: number, z: number];
    polygons: Vector2[][][];
  };
}

export default function City(props: CityProps) {
  const { data, bbox, depth, map } = props;
  const groupRef = useRef<Group>(null!);
  const tooltipRef = useRef<{ open: () => void; close: () => void }>(null!);
  const vector3 = useRef(new Vector3(1, 1, 1));
  const stats = cityStats[data.city as keyof typeof cityStats];

  const [shape, shapeGeometry] = useMemo(() => {
    const shapes = data.polygons.map((polygon) => {
      const [outerRing, ...holes] = polygon;
      const shape = new Shape(outerRing);
      holes.forEach((hole) => {
        shape.holes.push(new Shape(hole));
      });
      return shape;
    });
    const geometry = new ShapeGeometry(shapes);
    return [shapes, geometry];
  }, [data.polygons]);

  useFrame(() => {
    groupRef.current.scale.lerp(vector3.current, 0.1);
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation();
        vector3.current.setZ(1.4);
        tooltipRef.current.open();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        vector3.current.setZ(1);
        tooltipRef.current.close();
        document.body.style.cursor = "auto";
      }}>
      <ShapeMesh position-z={depth + 0.1} bbox={bbox} args={[shape]}>
        <meshStandardMaterial
          map={map}
          normalMap={props.normalMap}
          color="#ffffff"
          emissive="#0f172a"
          emissiveIntensity={0.04}
          metalness={0.04}
          roughness={0.86}
        />
      </ShapeMesh>
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[shape, { depth, steps: 1, bevelEnabled: false }]}
        />
        <meshStandardMaterial
          transparent
          opacity={0}
          metalness={0.04}
          roughness={0.95}
          side={DoubleSide}
          color="#ffffff"
        />
      </mesh>
      <lineSegments position-z={depth + 0.2} raycast={() => null}>
        <edgesGeometry args={[shapeGeometry]} />
        <lineBasicMaterial transparent opacity={0} color="#ffffff" />
      </lineSegments>

      <Bar position={data.cityId} value={stats?.output ?? 0} factor={4} max={60}>
        {(barHeight) => (
          <>
            <Label
              key={`${data.city}-label-show`}
              center
              position={[0, 0, barHeight + 0.8]}
              distanceFactor={100}
              zIndexRange={[100, 1000]}>
              {data.city}
            </Label>

            <Tooltip
              ref={tooltipRef}
              data={{ city: data.city }}
              position={[0, 0, barHeight + 6]}
              visible={false}
            />
          </>
        )}
      </Bar>
    </group>
  );
}
