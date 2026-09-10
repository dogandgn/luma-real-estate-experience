import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { projects, units } from './portfolio'
import { findNearby, sampleNearby } from './nearby'
import { defaultReportOptions, reportFilename, validateReport, type ReportContext } from './report'
import { buildReportPdf } from '../report/create-pdf'

const image = {
  dataUrl:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  width: 1,
  height: 1,
  capturedAt: '2026-09-09T12:00:00Z',
}
const context: ReportContext = {
  project: projects[0],
  unit: units[0],
  model: image,
  map: image,
  nearby: [],
  nearbyMode: 'unconnected',
  radius: 3,
  category: 'all',
  generatedAt: image.capturedAt,
  documentId: 'LUMA-TEST-01',
}
const nearby = findNearby(
  context.project.regionalPoint,
  3,
  sampleNearby(context.project.id, context.project.regionalPoint),
)
describe('Apartment PDF data integrity', () => {
  it('keeps selected project, apartment and captured data aligned', () => {
    expect(() => validateReport(context)).not.toThrow()
    expect(() => validateReport({ ...context, project: projects[1] })).toThrow('eşleşmiyor')
    expect(() => validateReport({ ...context, nearby })).toThrow('Bağlı olmayan')
    expect(() => validateReport({ ...context, nearbyMode: 'sample', nearby })).not.toThrow()
    expect(() =>
      validateReport({ ...context, nearbyMode: 'sample', nearby: [{ ...nearby[0], id: 'sample:other:1' }] }),
    ).toThrow('eşleşmiyor')
    expect(() => validateReport({ ...context, model: { ...image, width: 0 } })).toThrow('Görsel alınamadı')
  })
  it('names information and annex files distinctly', () => {
    expect(reportFilename(context, 'information')).toBe('luma-avlu-a-01-bilgi-foyu-2026-09-09.pdf')
    expect(reportFilename(context, 'annex')).toBe('luma-avlu-a-01-ek-taslagi-2026-09-09.pdf')
  })
  it('builds a three-page A4 PDF with the embedded Turkish font and actual image inputs', () => {
    const bytes = buildReportPdf(
      { ...context, nearby, nearbyMode: 'sample' },
      defaultReportOptions,
      readFileSync('public/fonts/DejaVuSans.ttf'),
    )
    const pdf = new TextDecoder('latin1').decode(bytes)
    expect(pdf.startsWith('%PDF-')).toBe(true)
    expect(pdf.match(/\/Type \/Page\b/g)).toHaveLength(3)
    expect(pdf).toContain('/FontFile2')
    expect(pdf).toContain('/Subtype /Image')
  })
  it('paginates maximum-length document notes without truncating them', () => {
    const bytes = buildReportPdf(
      context,
      {
        ...defaultReportOptions,
        customer: 'W'.repeat(80),
        advisor: 'W'.repeat(80),
        reference: 'W'.repeat(60),
        notes: 'W'.repeat(300),
      },
      readFileSync('public/fonts/DejaVuSans.ttf'),
    )
    expect(new TextDecoder('latin1').decode(bytes).match(/\/Type \/Page\b/g)).toHaveLength(4)
    if (process.env.LUMA_PDF_QA === '1') {
      mkdirSync('tmp/pdfs', { recursive: true })
      writeFileSync('tmp/pdfs/long-fields-test.pdf', bytes)
    }
  })
})
