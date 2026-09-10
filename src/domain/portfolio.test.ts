import { describe, expect, it } from 'vitest'
import {
  defaultFilters,
  filterProjects,
  projects,
  toGeoJSON,
  units,
  validatePortfolio,
  withinBounds,
} from './portfolio'

describe('Portfolio source of truth', () => {
  it('has unique valid IDs, coordinates and matching unit totals', () =>
    expect(validatePortfolio()).toEqual([]))
  it('contains 48 stable model selection IDs and 34 available units for Luma', () => {
    expect(units).toHaveLength(48)
    expect(units.filter((u) => u.status === 'Uygun')).toHaveLength(34)
    expect(new Set(units.map((u) => u.modelNodeId)).size).toBe(48)
  })
  it('exports the same identities in GeoJSON without claiming precise locations', () => {
    expect(toGeoJSON(projects).features.map((f) => f.id)).toEqual(projects.map((p) => p.id))
    expect(toGeoJSON(projects).features.every((f) => f.properties?.locationMode === 'regional')).toBe(true)
  })
})
describe('Project filtering', () => {
  it('supports Turkish case-insensitive search', () =>
    expect(filterProjects(projects, { ...defaultFilters, query: 'KIYI' }).map((p) => p.id)).toEqual([
      'kiyi-rezidans',
    ]))
  it('combines region, type and availability', () =>
    expect(
      filterProjects(projects, {
        ...defaultFilters,
        district: 'Narlıdere',
        type: 'Villa',
        availableOnly: true,
      }),
    ).toHaveLength(0))
  it('uses starting price rather than the most expensive unit', () =>
    expect(filterProjects(projects, { ...defaultFilters, maxPrice: 8400000 }).map((p) => p.id)).toEqual([
      'luma-avlu',
      'teras-35',
      'kent-avlu',
    ]))
  it('respects an explicit viewport and keeps source order intact', () => {
    expect(filterProjects(projects, defaultFilters, [26.7, 38.3, 26.8, 38.35]).map((p) => p.id)).toEqual([
      'zeytin-evleri',
      'koru-yasam',
    ])
    expect(projects[0].id).toBe('luma-avlu')
  })
  it('handles longitude wrap and inclusive boundaries', () => {
    expect(withinBounds([175, 0], [170, -10, -170, 10])).toBe(true)
    expect(withinBounds([0, 0], [170, -10, -170, 10])).toBe(false)
    expect(withinBounds([26.8, 38.35], [26.7, 38.3, 26.8, 38.35])).toBe(true)
  })
})
