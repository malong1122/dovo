/**
 * 通用 GeoJSON 类型定义
 */
export type GeoJSONGeometryType =
  | "Point"
  | "MultiPoint"
  | "LineString"
  | "MultiLineString"
  | "Polygon"
  | "MultiPolygon"
  | "GeometryCollection";

export interface GeoJSONGeometry {
  type: GeoJSONGeometryType;
  coordinates:
    | number[] // Point
    | number[][] // LineString
    | number[][][] // Polygon
    | number[][][][] // MultiPolygon
    | number[][][][][]; // 兼容 GeometryCollection 的嵌套情况
}

export interface GeoJSONFeature<
  P = Record<string, unknown>,
  G = GeoJSONGeometry
> {
  type: "Feature";
  geometry: G;
  properties: P;
}

export interface GeoJSONFeatureCollection<
  P = Record<string, unknown>,
  G = GeoJSONGeometry
> {
  type: "FeatureCollection";
  features: GeoJSONFeature<P, G>[];
}

export interface CityProperties {
  adcode: number;
  name: string;
  center: [number, number];
  centroid: [number, number];
  childrenNum: number;
  level: string;
  parent: { adcode: number };
  subFeatureIndex: number;
  acroutes: number[];
}

export type CityGeoJSON = GeoJSONFeatureCollection<
  CityProperties,
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] }
>;

/**
 * 牛羊肉企业
 */
export interface Enterprise {
  id: string;
  name: string;
  type: "cattle" | "sheep" | "both";
  category: "farming" | "processing" | "sales" | "integrated";
  regionCode: string;
  regionName: string;
  address: string;
  lng: number;
  lat: number;
  scale: "large" | "medium" | "small";
  annualOutput: number; // 万吨
  annualRevenue: number; // 万元
  employeeCount: number;
  mainProducts: string[];
  established: number; // 年份
}

/**
 * 产业链关系
 */
export interface SupplyChain {
  id: string;
  fromId: string;
  toId: string;
  type: "farming-processing" | "processing-sales";
}
