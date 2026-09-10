import rawProjects from '../data/projects.json'
import rawUnitMedia from '../data/unit-media.json'
import type { FeatureCollection, Point } from 'geojson'
import type { Bounds, Filters, Project, Unit, UnitMedia } from './types'
import { getUnitPlan } from './unit-presentation'
import { publicAsset } from '../utils/public-asset'

export const projects = (rawProjects as Project[]).map((project) => ({
  ...project,
  modelUrl: project.modelUrl ? publicAsset(project.modelUrl) : null,
}))
export const defaultFilters: Filters = {
  query: '',
  district: '',
  type: '',
  delivery: '',
  maxPrice: 40000000,
  availableOnly: false,
}
export const districts = [...new Set(projects.map((p) => p.district))].sort((a, b) =>
  a.localeCompare(b, 'tr'),
)
export const currency = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)
export const shortPrice = (n: number) =>
  `${new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(n / 1000000)} Mn ₺`
export function withinBounds(point: [number, number], bounds: Bounds) {
  const [west, south, east, north] = bounds
  const longitudeMatch =
    west <= east ? point[0] >= west && point[0] <= east : point[0] >= west || point[0] <= east
  return longitudeMatch && point[1] >= south && point[1] <= north
}
export function filterProjects(data: Project[], filters: Filters, bounds: Bounds | null = null): Project[] {
  const query = filters.query.trim().toLocaleLowerCase('tr-TR')
  return data.filter(
    (p) =>
      (!query || `${p.name} ${p.district} ${p.type}`.toLocaleLowerCase('tr-TR').includes(query)) &&
      (!filters.district || p.district === filters.district) &&
      (!filters.type || p.type === filters.type) &&
      (!filters.delivery || p.delivery === filters.delivery) &&
      p.minPrice <= filters.maxPrice &&
      (!filters.availableOnly || p.availableUnits > 0) &&
      (!bounds || withinBounds(p.regionalPoint, bounds)),
  )
}
export function toGeoJSON(data: Project[]): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: data.map((p) => ({
      type: 'Feature',
      id: p.id,
      geometry: { type: 'Point', coordinates: p.regionalPoint },
      properties: {
        id: p.id,
        name: p.name,
        district: p.district,
        priceLabel: shortPrice(p.minPrice),
        locationMode: p.locationMode,
      },
    })),
  }
}

const unitMedia = rawUnitMedia as Record<string, { planUrl?: string | null; links?: UnitMedia[] }>
// Sample inventory only. Stable IDs map to GLB nodes and schematic plan types.
export const units: Unit[] = Array.from({ length: 48 }, (_, index) => {
  const block = index < 24 ? 'A' : 'B'
  const localIndex = index % 24
  const floor = Math.floor(localIndex / 4) + 1
  const position = localIndex % 4
  const rooms = ['1+1', '2+1', '2+1', '3+1'][position]
  const netArea = [64, 91, 98, 148][position]
  const id = `luma-${block.toLowerCase()}-${String(localIndex + 1).padStart(2, '0')}`
  return {
    id,
    projectId: 'luma-avlu',
    buildingId: `luma-${block.toLowerCase()}`,
    floorId: `luma-${block.toLowerCase()}-f${floor}`,
    block,
    floor,
    number: `${block}-${String(localIndex + 1).padStart(2, '0')}`,
    rooms,
    netArea,
    grossArea: Math.round(netArea * 1.2),
    aspect: ['Güney', 'Doğu', 'Batı', 'Kuzey'][position],
    price: 8400000 + position * 1600000 + (floor - 1) * 460000 + (block === 'B' ? 300000 : 0),
    status: index < 34 ? 'Uygun' : index < 40 ? 'Rezerve' : 'Satıldı',
    modelNodeId: id,
    planId: `luma-type-0${position + 1}`,
    planUrl: unitMedia[id]?.planUrl ?? null,
    tourUrl: null,
    media: unitMedia[id]?.links ?? [],
  }
})

export function validatePortfolio() {
  const errors: string[] = []
  if (new Set(projects.map((p) => p.id)).size !== projects.length) errors.push('Tekrarlanan proje kimliği')
  if (new Set(units.map((u) => u.id)).size !== units.length) errors.push('Tekrarlanan daire kimliği')
  for (const p of projects) {
    if (
      p.locationMode !== 'regional' ||
      p.regionalPoint.length !== 2 ||
      p.regionalPoint.some((n) => !Number.isFinite(n)) ||
      Math.abs(p.regionalPoint[0]) > 180 ||
      Math.abs(p.regionalPoint[1]) > 90
    )
      errors.push(`Geçersiz konum: ${p.id}`)
    if (p.availableUnits > p.totalUnits) errors.push(`Geçersiz envanter: ${p.id}`)
    if (p.hasInventory) {
      const inventory = units.filter((u) => u.projectId === p.id)
      if (
        inventory.length !== p.totalUnits ||
        inventory.filter((u) => u.status === 'Uygun').length !== p.availableUnits
      )
        errors.push(`Envanter özeti eşleşmiyor: ${p.id}`)
    }
  }
  for (const u of units) {
    if (!projects.some((p) => p.id === u.projectId) || u.netArea >= u.grossArea)
      errors.push(`Geçersiz daire: ${u.id}`)
    if (u.planId && !getUnitPlan(u)) errors.push(`Daire plan tipi eşleşmiyor: ${u.id}`)
  }
  return errors
}
