import type { Unit, UnitMedia, UnitMediaKind } from './types'

export interface PlanRoom {
  id: string
  name: string
  kind: 'living' | 'bedroom' | 'service' | 'hall' | 'outdoor'
  x: number
  y: number
  width: number
  height: number
}
export interface PlanOpening {
  x1: number
  y1: number
  x2: number
  y2: number
  kind: 'door' | 'window' | 'entry'
}
export interface SchematicPlan {
  id: string
  label: string
  rooms: string
  referenceNetArea: number
  spaces: PlanRoom[]
  openings: PlanOpening[]
}

const room = (
  id: string,
  name: string,
  kind: PlanRoom['kind'],
  x: number,
  y: number,
  width: number,
  height: number,
): PlanRoom => ({ id, name, kind, x, y, width, height })
const opening = (kind: PlanOpening['kind'], x1: number, y1: number, x2: number, y2: number): PlanOpening => ({
  kind,
  x1,
  y1,
  x2,
  y2,
})

// Diagram coordinates, not metres. No drawn dimensions or room-area claims.
export const schematicPlans: SchematicPlan[] = [
  {
    id: 'luma-type-01',
    label: 'Tip 01',
    rooms: '1+1',
    referenceNetArea: 64,
    spaces: [
      room('living', 'Salon + açık mutfak', 'living', 60, 195, 340, 210),
      room('bed-1', 'Yatak odası', 'bedroom', 60, 55, 340, 140),
      room('bath', 'Banyo', 'service', 400, 55, 200, 140),
      room('hall', 'Antre', 'hall', 400, 195, 200, 210),
      room('balcony', 'Balkon', 'outdoor', 60, 405, 340, 65),
    ],
    openings: [
      opening('entry', 470, 405, 525, 405),
      opening('door', 400, 260, 400, 310),
      opening('door', 340, 195, 388, 195),
      opening('door', 470, 195, 518, 195),
      opening('door', 160, 405, 220, 405),
      opening('window', 140, 55, 280, 55),
      opening('window', 60, 260, 60, 350),
      opening('window', 480, 55, 540, 55),
    ],
  },
  {
    id: 'luma-type-02',
    label: 'Tip 02',
    rooms: '2+1',
    referenceNetArea: 91,
    spaces: [
      room('bed-1', 'Yatak odası', 'bedroom', 60, 55, 240, 150),
      room('bed-2', 'Çocuk odası', 'bedroom', 300, 55, 170, 150),
      room('bath', 'Banyo', 'service', 470, 55, 150, 150),
      room('hall', 'Antre / hol', 'hall', 60, 205, 560, 60),
      room('living', 'Salon', 'living', 60, 265, 350, 150),
      room('kitchen', 'Mutfak', 'service', 410, 265, 210, 150),
      room('balcony', 'Balkon', 'outdoor', 60, 415, 350, 60),
    ],
    openings: [
      opening('entry', 620, 209, 620, 258),
      opening('door', 220, 205, 270, 205),
      opening('door', 350, 205, 400, 205),
      opening('door', 520, 205, 565, 205),
      opening('door', 200, 265, 250, 265),
      opening('door', 480, 265, 530, 265),
      opening('door', 200, 415, 265, 415),
      opening('window', 110, 55, 225, 55),
      opening('window', 330, 55, 420, 55),
      opening('window', 60, 310, 60, 385),
      opening('window', 490, 415, 570, 415),
    ],
  },
  {
    id: 'luma-type-03',
    label: 'Tip 03',
    rooms: '2+1',
    referenceNetArea: 98,
    spaces: [
      room('living', 'Salon', 'living', 60, 55, 300, 170),
      room('kitchen', 'Mutfak', 'service', 360, 55, 260, 170),
      room('hall', 'Antre / hol', 'hall', 60, 225, 560, 60),
      room('bed-1', 'Yatak odası', 'bedroom', 60, 285, 260, 160),
      room('bed-2', 'Çocuk odası', 'bedroom', 320, 285, 160, 160),
      room('bath', 'Banyo', 'service', 480, 285, 140, 160),
      room('balcony', 'Balkon', 'outdoor', 60, 0, 300, 55),
    ],
    openings: [
      opening('entry', 620, 229, 620, 279),
      opening('door', 150, 225, 205, 225),
      opening('door', 450, 225, 500, 225),
      opening('door', 210, 285, 260, 285),
      opening('door', 355, 285, 405, 285),
      opening('door', 530, 285, 575, 285),
      opening('door', 150, 55, 210, 55),
      opening('window', 460, 55, 555, 55),
      opening('window', 120, 445, 250, 445),
      opening('window', 350, 445, 435, 445),
    ],
  },
  {
    id: 'luma-type-04',
    label: 'Tip 04',
    rooms: '3+1',
    referenceNetArea: 148,
    spaces: [
      room('bed-1', 'Yatak odası', 'bedroom', 40, 55, 210, 150),
      room('bed-2', 'Çocuk odası', 'bedroom', 250, 55, 170, 150),
      room('bed-3', 'Çalışma / yatak odası', 'bedroom', 420, 55, 220, 150),
      room('hall', 'Antre / hol', 'hall', 40, 205, 600, 65),
      room('living', 'Salon', 'living', 40, 270, 295, 160),
      room('kitchen', 'Mutfak', 'service', 335, 270, 180, 160),
      room('bath', 'Banyo', 'service', 515, 270, 125, 95),
      room('wc', 'WC', 'service', 515, 365, 125, 65),
      room('balcony', 'Balkon', 'outdoor', 40, 430, 295, 55),
    ],
    openings: [
      opening('entry', 640, 212, 640, 262),
      opening('door', 175, 205, 225, 205),
      opening('door', 310, 205, 360, 205),
      opening('door', 490, 205, 540, 205),
      opening('door', 180, 270, 235, 270),
      opening('door', 390, 270, 435, 270),
      opening('door', 555, 270, 605, 270),
      opening('door', 515, 378, 515, 416),
      opening('door', 140, 430, 200, 430),
      opening('window', 100, 55, 200, 55),
      opening('window', 285, 55, 380, 55),
      opening('window', 475, 55, 590, 55),
      opening('window', 40, 300, 40, 390),
      opening('window', 385, 430, 460, 430),
    ],
  },
]

export function getUnitPlan(unit: Unit) {
  return (
    schematicPlans.find(
      (p) => p.id === unit.planId && p.rooms === unit.rooms && p.referenceNetArea === unit.netArea,
    ) ?? null
  )
}

const mediaLabels: Record<UnitMediaKind, string> = {
  matterport: 'Matterport turu',
  tour: '360° sanal tur',
  ar: 'AR uygulaması',
  vr: 'VR deneyimi',
  video: 'Tanıtım videosu',
}

/** Only user-activated navigation; no embed, fetch, tracking or auto-launch. */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value || /[\u0000-\u0020\\]/.test(value)) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

export function safePlanUrl(value: unknown): string | null {
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return null
  // Keep local documents in a dedicated public directory. Reject path traversal.
  if (
    value.startsWith('/plans/') &&
    !value.includes('%') &&
    !value.includes('..') &&
    !value.includes('?') &&
    !value.includes('#')
  )
    return value
  return safeExternalUrl(value)
}

export function getUnitLinks(unit: Pick<Unit, 'media' | 'tourUrl'>) {
  const candidates: UnitMedia[] = Array.isArray(unit.media) ? [...unit.media] : []
  if (unit.tourUrl) candidates.push({ kind: 'tour', url: unit.tourUrl })
  const seen = new Set<string>()
  return candidates.flatMap((item) => {
    if (!item || !Object.hasOwn(mediaLabels, item.kind)) return []
    const url = safeExternalUrl(item.url)
    if (!url || seen.has(url)) return []
    if (item.kind === 'matterport' && new URL(url).hostname !== 'my.matterport.com') return []
    seen.add(url)
    return [{ kind: item.kind, label: mediaLabels[item.kind], url, hostname: new URL(url).hostname }]
  })
}
