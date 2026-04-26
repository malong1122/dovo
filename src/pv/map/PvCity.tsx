import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import {
  DoubleSide,
  Shape,
  ShapeGeometry,
  Vector3,
  type Box2,
  type MeshStandardMaterialProperties,
  type Vector2,
  type Group,
} from 'three'
import ShapeMesh from '@/map/shape'

export interface PvCityProps {
  map?: MeshStandardMaterialProperties['map']
  normalMap?: MeshStandardMaterialProperties['normalMap']
  bbox: Box2
  depth: number
  data: {
    city: string
    cityId: [x: number, y: number, z: number]
    polygons: Vector2[][][]
  }
}

export default function PvCity(props: PvCityProps) {
  const { data, bbox, depth, map } = props
  const groupRef = useRef<Group>(null!)
  const scaleTarget = useRef(new Vector3(1, 1, 1))

  const [shape, shapeGeometry] = useMemo(() => {
    const shapes = data.polygons.map((polygon) => {
      const [outerRing, ...holes] = polygon
      const s = new Shape(outerRing)
      holes.forEach((hole) => s.holes.push(new Shape(hole)))
      return s
    })
    return [shapes, new ShapeGeometry(shapes)]
  }, [data.polygons])

  useFrame(() => {
    groupRef.current.scale.lerp(scaleTarget.current, 0.1)
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        scaleTarget.current.setZ(1.3)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        scaleTarget.current.setZ(1)
        document.body.style.cursor = 'auto'
      }}>
      {/* 地图面 */}
      <ShapeMesh position-z={depth + 0.1} bbox={bbox} args={[shape]}>
        <meshStandardMaterial
          map={map}
          normalMap={props.normalMap}
          color="#ffffff"
          emissive="#0f172a"
          emissiveIntensity={0.08}
          metalness={0.04}
          roughness={0.86}
        />
      </ShapeMesh>

      {/* 侧面 */}
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth, steps: 1, bevelEnabled: false }]} />
        <meshStandardMaterial
          transparent
          opacity={0}
          metalness={0.04}
          roughness={0.95}
          side={DoubleSide}
          color="#ffffff"
        />
      </mesh>

      {/* 边线 */}
      <lineSegments position-z={depth + 0.2} raycast={() => null}>
        <edgesGeometry args={[shapeGeometry]} />
        <lineBasicMaterial transparent opacity={0} color="#ffffff" />
      </lineSegments>

      {/* 市名标签 */}
      <Html
        position={data.cityId}
        center
        distanceFactor={100}
        zIndexRange={[0, 50]}
        style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(255,245,232,0.88)',
          border: '1px solid rgba(217,119,6,0.45)',
          color: '#92400e',
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 3,
          whiteSpace: 'nowrap',
        }}>
          {data.city}
        </div>
      </Html>
    </group>
  )
}
