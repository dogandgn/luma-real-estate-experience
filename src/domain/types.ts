export type ProjectType = 'Konut' | 'Villa' | 'Karma'
export type Delivery = 'İnşaat halinde' | 'Teslime hazır' | 'Planlama'
export type UnitStatus = 'Uygun' | 'Rezerve' | 'Satıldı'
export type UnitMediaKind = 'matterport' | 'tour' | 'ar' | 'vr' | 'video'
export interface UnitMedia {
  kind: UnitMediaKind
  url: string
}
export interface Project {
  id: string
  name: string
  district: string
  type: ProjectType
  delivery: Delivery
  deliveryDate: string
  regionalPoint: [number, number]
  locationMode: 'regional'
  minPrice: number
  maxPrice: number
  totalUnits: number
  availableUnits: number
  rooms: string[]
  areaRange: [number, number]
  description: string
  amenities: string[]
  image: 'residence' | 'villa'
  hasInventory: boolean
  modelUrl: string | null
}
export interface Unit {
  id: string
  projectId: string
  buildingId: string
  floorId: string
  block: 'A' | 'B'
  floor: number
  number: string
  rooms: string
  netArea: number
  grossArea: number
  aspect: string
  price: number
  status: UnitStatus
  modelNodeId: string
  planId: string | null
  planUrl: string | null
  tourUrl: string | null
  media: UnitMedia[]
}
export interface Filters {
  query: string
  district: string
  type: string
  delivery: string
  maxPrice: number
  availableOnly: boolean
}
export type Bounds = [number, number, number, number]
