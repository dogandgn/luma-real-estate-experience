import type { FeatureCollection, Point } from 'geojson'

export const categories = [
  { id: 'bus', label: 'Otobüs', color: '#326c89', symbol: 'O' },
  { id: 'metro', label: 'Metro / raylı', color: '#8b5d8e', symbol: 'M' },
  { id: 'education', label: 'Eğitim', color: '#a37032', symbol: 'E' },
  { id: 'health', label: 'Sağlık', color: '#b15960', symbol: '+' },
  { id: 'park', label: 'Park', color: '#4b7955', symbol: 'P' },
] as const
export type Category = (typeof categories)[number]['id']
export interface NearbyPoint {
  id: string
  name: string
  category: Category
  coordinates: [number, number]
}
export interface NearbyResult extends NearbyPoint {
  distance: number
}
export function distanceKm(a: [number, number], b: [number, number]) {
  const rad = Math.PI / 180
  const h =
    Math.sin(((b[1] - a[1]) * rad) / 2) ** 2 +
    Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(((b[0] - a[0]) * rad) / 2) ** 2
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.min(1, h)))
}
export function findNearby(center: [number, number], radius: number, points: NearbyPoint[]): NearbyResult[] {
  return points
    .map((p) => ({ ...p, distance: distanceKm(center, p.coordinates) }))
    .filter((p) => p.distance <= radius)
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id))
}
// Cap each category separately: dense bus stops must not hide sparse metro stations.
export function visibleNearby(points: NearbyResult[], category: Category | 'all') {
  const counts = new Map<string, number>()
  return points.filter((p) => {
    if (category !== 'all' && p.category !== category) return false
    const count = counts.get(p.category) ?? 0
    counts.set(p.category, count + 1)
    return count < (category === 'all' ? 4 : 12)
  })
}
export function nearbyGeoJSON(points: NearbyResult[], selectedId: string | null): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => {
      const c = categories.find((c) => c.id === p.category)!
      return {
        type: 'Feature',
        id: p.id,
        geometry: { type: 'Point', coordinates: p.coordinates },
        properties: {
          id: p.id,
          name: p.name,
          color: c.color,
          symbol: c.symbol,
          selected: p.id === selectedId,
        },
      }
    }),
  }
}
export const formatDistance = (km: number) =>
  km < 1 ? `${Math.round((km * 1000) / 10) * 10} m` : `${km.toFixed(1).replace('.', ',')} km`

/** Interaction fixtures only. These are not real facilities or transit stations. */
export function sampleNearby(projectId: string, center: [number, number]): NearbyPoint[] {
  const fixtures: Array<[Category, string, number, number]> = [
    ['bus', 'Örnek otobüs noktası 01', -0.005, 0.004],
    ['bus', 'Örnek otobüs noktası 02', 0.008, -0.003],
    ['metro', 'Örnek metro noktası', 0.017, 0.008],
    ['education', 'Örnek eğitim noktası', -0.009, -0.006],
    ['health', 'Örnek sağlık noktası', 0.004, -0.011],
    ['park', 'Örnek park noktası', -0.011, 0.012],
  ]
  return fixtures.map(([category, name, x, y], index) => ({
    id: `sample:${projectId}:${index}`,
    name,
    category,
    coordinates: [center[0] + x, center[1] + y],
  }))
}
