import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { categories, distanceKm, findNearby, nearbyGeoJSON, sampleNearby, visibleNearby } from './nearby'
import { projects, units } from './portfolio'
import { ProjectExplorer } from '../components/ProjectExplorer'
import { UnitInspector } from '../components/UnitInspector'

describe('nearby interaction contract', () => {
  it('uses stable, explicitly sample identifiers for every project and category', () => {
    const all = projects.flatMap((p) => sampleNearby(p.id, p.regionalPoint))
    expect(new Set(all.map((p) => p.id)).size).toBe(all.length)
    expect(all.every((p) => p.id.startsWith('sample:') && p.name.startsWith('Örnek'))).toBe(true)
    for (const project of projects)
      expect(new Set(sampleNearby(project.id, project.regionalPoint).map((p) => p.category)).size).toBe(
        categories.length,
      )
  })
  it('filters distance/category before emitting the map features', () => {
    const project = projects[0]
    const all = findNearby(project.regionalPoint, 3, sampleNearby(project.id, project.regionalPoint))
    expect(all).toHaveLength(6)
    expect(all.every((p, i) => !i || p.distance >= all[i - 1].distance)).toBe(true)
    expect(findNearby(project.regionalPoint, 0.1, all)).toHaveLength(0)
    const metros = visibleNearby(all, 'metro')
    expect(metros).toHaveLength(1)
    const geo = nearbyGeoJSON(metros, metros[0].id)
    expect(geo.features).toHaveLength(1)
    expect(geo.features[0].properties?.selected).toBe(true)
    expect(nearbyGeoJSON(metros, null).features[0].properties?.selected).toBe(false)
    expect(distanceKm([0, 0], [0, 1])).toBeCloseTo(111.195, 2)
  })
  it('does not present an unconnected feed as zero real amenities', () => {
    const markup = renderToStaticMarkup(
      <ProjectExplorer
        project={projects[0]}
        category="all"
        radius={3}
        points={[]}
        allPoints={[]}
        selectedPoi={null}
        sampleMode={false}
        onSampleMode={() => {}}
        onCategory={() => {}}
        onRadius={() => {}}
        onSelectPoi={() => {}}
        onClose={() => {}}
        onOpen={() => {}}
      />,
    )
    expect(markup).toContain('Donatı verisi henüz bağlı değil')
    expect(markup).toContain('Örnek akışı dene')
    expect(markup).not.toContain('Bu kapsamda kayıt bulunamadı')
  })
  it('provides a separate accessible apartment inspector with plan and navigation', () => {
    const markup = renderToStaticMarkup(
      <UnitInspector
        projectName={projects[0].name}
        totalFloors={6}
        unit={units[0]}
        units={units}
        onClose={() => {}}
        onPlan={() => {}}
        onFocus={() => {}}
        onSelect={() => {}}
      />,
    )
    expect(markup).toContain('aria-label="Seçili daire bilgileri"')
    expect(markup).toContain('A-01')
    expect(markup).toContain('Seçili daireye odaklan')
    expect(markup).toContain('kat planını aç')
    expect(markup).toContain('aria-label="Önceki daire" disabled')
  })
})
