import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { projects, units } from './portfolio'
import { getUnitLinks, getUnitPlan, safeExternalUrl, safePlanUrl, schematicPlans } from './unit-presentation'
import { UnitSheet } from '../components/UnitSheet'

describe('Daire dosyası ve plan eşleşmesi', () => {
  it('48 daireyi dört uygun şemaya bağlar; uyuşmayan veriye plan vermez', () => {
    expect(schematicPlans).toHaveLength(4)
    for (const plan of schematicPlans)
      expect(units.filter((u) => getUnitPlan(u)?.id === plan.id)).toHaveLength(12)
    for (const unit of units) {
      const plan = getUnitPlan(unit)!
      expect(plan.rooms).toBe(unit.rooms)
      expect(plan.referenceNetArea).toBe(unit.netArea)
    }
    expect(getUnitPlan({ ...units[0], rooms: '3+1' })).toBe(null)
    expect(getUnitPlan({ ...units[0], planId: 'unknown' })).toBe(null)
  })
  it('şemalarda doğru yatak odası sayısı, benzersiz alanlar ve çakışmayan odalar vardır', () => {
    for (const plan of schematicPlans) {
      expect(plan.spaces.filter((s) => s.kind === 'bedroom')).toHaveLength(Number(plan.rooms.split('+')[0]))
      expect(new Set(plan.spaces.map((s) => s.id)).size).toBe(plan.spaces.length)
      expect(plan.openings.some((o) => o.kind === 'entry')).toBe(true)
      for (const space of plan.spaces) {
        expect(
          space.width > 0 &&
            space.height > 0 &&
            space.x >= 0 &&
            space.y >= 0 &&
            space.x + space.width <= 680 &&
            space.y + space.height <= 530,
        ).toBe(true)
        for (const other of plan.spaces.filter((s) => s !== space)) {
          const overlapX = Math.min(space.x + space.width, other.x + other.width) - Math.max(space.x, other.x)
          const overlapY =
            Math.min(space.y + space.height, other.y + other.height) - Math.max(space.y, other.y)
          expect(overlapX > 0 && overlapY > 0).toBe(false)
        }
      }
    }
  })
  it('yalnızca güvenli bağlantı biçimlerini kabul eder', () => {
    for (const unsafe of [
      'javascript:alert(1)',
      'data:text/html,test',
      'http://example.test',
      '//example.test',
      'https://user:password@example.test',
      'https://example.test\\other',
      ' https://example.test',
    ])
      expect(safeExternalUrl(unsafe)).toBe(null)
    expect(safeExternalUrl('https://example.test/tour')).toBe('https://example.test/tour')
    expect(safePlanUrl('/plans/a-01.pdf')).toBe('/plans/a-01.pdf')
    expect(safePlanUrl('/plans/../private.json')).toBe(null)
    expect(safePlanUrl('/plans/%2e%2e/private.json')).toBe(null)
    expect(safePlanUrl('//example.test/plan')).toBe(null)
  })
  it('boş, sahte Matterport ve tekrarlanan medya bağlantıları üretmez', () => {
    expect(getUnitLinks({ media: [], tourUrl: null })).toEqual([])
    const links = getUnitLinks({
      tourUrl: 'https://example.test/tour',
      media: [
        { kind: 'matterport', url: 'https://example.test/not-matterport' },
        { kind: 'ar', url: 'javascript:alert(1)' },
        { kind: 'tour', url: 'https://example.test/tour' },
        { kind: 'matterport', url: 'https://my.matterport.com/show/?m=test-fixture' },
      ],
    })
    expect(links.map((l) => l.kind)).toEqual(['tour', 'matterport'])
  })
  it('seçilen dairenin dosyasını, uyarıyı ve koşullu bağlantıyı aynı kayıttan sunar', () => {
    const unit = { ...units[47], planUrl: '/plans/b-24.pdf' }
    const html = renderToStaticMarkup(
      <UnitSheet
        unit={unit}
        project={projects[0]}
        visibleUnits={units}
        onSelect={() => {}}
        onClose={() => {}}
        onLocate={() => {}}
      />,
    )
    expect(html).toContain('B-24')
    expect(html).toContain('Tip 04')
    expect(html).toContain('Ölçeksiz demo şeması')
    expect(html).toContain('href="/plans/b-24.pdf"')
    expect(html).toContain('rel="noopener noreferrer"')
    expect(html).not.toContain('<iframe')
    expect(html).not.toContain('href="javascript:')
    expect(html).toContain('Sanal tur, Matterport ve AR/VR bağlantıları henüz eklenmedi.')
  })
})
