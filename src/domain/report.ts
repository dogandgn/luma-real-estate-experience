import type { Project, Unit } from './types'
import type { Category, NearbyResult } from './nearby'

export interface ViewSnapshot {
  dataUrl: string
  width: number
  height: number
  capturedAt: string
}
export type CaptureView = () => Promise<ViewSnapshot>
export interface ReportOptions {
  purpose: 'information' | 'annex'
  customer: string
  advisor: string
  reference: string
  appendix: string
  notes: string
}
export const defaultReportOptions: ReportOptions = {
  purpose: 'information',
  customer: '',
  advisor: '',
  reference: '',
  appendix: '',
  notes: '',
}
export interface ReportContext {
  project: Project
  unit: Unit
  model: ViewSnapshot
  map: ViewSnapshot
  nearby: NearbyResult[]
  nearbyMode: 'unconnected' | 'sample'
  radius: number
  category: Category | 'all'
  generatedAt: string
  documentId: string
}
export function reportFilename(context: ReportContext, purpose: ReportOptions['purpose']) {
  return `${context.project.id}-${context.unit.number.toLowerCase()}-${purpose === 'annex' ? 'ek-taslagi' : 'bilgi-foyu'}-${context.generatedAt.slice(0, 10)}.pdf`
}
export function validateReport(context: ReportContext) {
  if (context.unit.projectId !== context.project.id) throw new Error('Daire ve proje bilgileri eşleşmiyor.')
  for (const image of [context.model, context.map]) {
    if (!image.dataUrl.startsWith('data:image/png;base64,') || image.width < 1 || image.height < 1)
      throw new Error('Görsel alınamadı. Harita ve 3B model yüklendikten sonra yeniden deneyin.')
  }
  if (context.nearbyMode === 'unconnected' && context.nearby.length)
    throw new Error('Bağlı olmayan donatı kaynağı veri içeremez.')
  if (
    context.nearbyMode === 'sample' &&
    context.nearby.some((p) => !p.id.startsWith(`sample:${context.project.id}:`))
  )
    throw new Error('Donatı örnekleri seçili projeyle eşleşmiyor.')
}
