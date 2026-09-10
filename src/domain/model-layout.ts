import type { Unit } from './types'

export const FLOOR_HEIGHT = 3.2
export const BASE_HEIGHT = 0.65
export const BLOCK_X = { A: -18, B: 18 } as const

/** Local metres, Y up; north is -Z. Concept selection volumes, not floor plans. */
export function unitVolume(unit: Pick<Unit, 'block' | 'floor' | 'aspect'>) {
  const x = BLOCK_X[unit.block]
  const y = BASE_HEIGHT + (unit.floor - 0.5) * FLOOR_HEIGHT
  switch (unit.aspect) {
    case 'Güney':
      return { center: [x, y, 6] as const, size: [20, 2.95, 6] as const, angle: 0 }
    case 'Doğu':
      return { center: [x + 7, y, 0] as const, size: [6, 2.95, 6] as const, angle: Math.PI / 2 }
    case 'Batı':
      return { center: [x - 7, y, 0] as const, size: [6, 2.95, 6] as const, angle: -Math.PI / 2 }
    case 'Kuzey':
      return { center: [x, y, -6] as const, size: [20, 2.95, 6] as const, angle: Math.PI }
    default:
      throw new Error(`Bilinmeyen cephe: ${unit.aspect}`)
  }
}

export interface UnitFilters {
  block: string
  floor: string
  room: string
  status: string
}
export const emptyUnitFilters: UnitFilters = { block: '', floor: '', room: '', status: '' }
export function filterUnits(units: Unit[], filters: UnitFilters) {
  return units.filter(
    (u) =>
      (!filters.block || u.block === filters.block) &&
      (!filters.floor || u.floor === Number(filters.floor)) &&
      (!filters.room || u.rooms === filters.room) &&
      (!filters.status || u.status === filters.status),
  )
}
