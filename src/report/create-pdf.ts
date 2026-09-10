import { jsPDF } from 'jspdf'
import { categories, formatDistance } from '../domain/nearby'
import { getUnitPlan } from '../domain/unit-presentation'
import { validateReport, type ReportContext, type ReportOptions, type ViewSnapshot } from '../domain/report'
import { publicAsset } from '../utils/public-asset'

let fontRequest: Promise<Uint8Array> | null = null
async function loadFont() {
  if (!fontRequest)
    fontRequest = fetch(publicAsset('/fonts/DejaVuSans.ttf'))
      .then(async (response) => {
        if (!response.ok) throw new Error('PDF yazı tipi yüklenemedi. Yeniden deneyin.')
        return new Uint8Array(await response.arrayBuffer())
      })
      .catch((error) => {
        fontRequest = null
        throw error
      })
  return fontRequest
}
export async function createReportPdf(context: ReportContext, options: ReportOptions) {
  return buildReportPdf(context, options, await loadFont())
}

/** Browser and node use this same vector/text PDF builder. No DOM screenshot library. */
export function buildReportPdf(c: ReportContext, raw: ReportOptions, font: Uint8Array): Uint8Array {
  validateReport(c)
  const clean = (value: string, max: number) =>
    value
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '')
      .trim()
      .slice(0, max)
  const o = {
    ...raw,
    customer: clean(raw.customer, 80),
    advisor: clean(raw.advisor, 80),
    reference: clean(raw.reference, 60),
    appendix: clean(raw.appendix, 12),
    notes: clean(raw.notes, 300),
  }
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true })
  let binary = ''
  for (let i = 0; i < font.length; i += 8192) binary += String.fromCharCode(...font.subarray(i, i + 8192))
  doc.addFileToVFS('DejaVuSans.ttf', btoa(binary))
  doc.addFont('DejaVuSans.ttf', 'LumaPDF', 'normal')
  doc.setFont('LumaPDF')
  doc.setLineHeightFactor(1.35)
  const ink = '#193D40',
    muted = '#5B6E6D',
    copper = '#A77640',
    light = '#EFF3EE'
  const date = new Date(c.generatedAt).toLocaleString('tr-TR', {
    timeZone: 'Europe/Istanbul',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const title = o.purpose === 'annex' ? 'Ek doküman taslağı' : 'Daire bilgi föyü'
  doc.setProperties({
    title: `${c.project.name} ${c.unit.number} - ${title}`,
    subject: 'Temsili proje bilgileri, 3B görünüm, bölgesel konum ve yakın çevre',
    author: o.advisor || 'Luma portföy demosu',
    creator: 'Luma yerel PDF çıktısı',
  })
  const text = (value: string, x: number, y: number, size = 10, color = ink, width?: number) => {
    doc.setFontSize(size)
    doc.setTextColor(color)
    const lines: string[] = width ? doc.splitTextToSize(value, width) : [value]
    doc.text(lines, x, y)
    return y + lines.length * size * 0.3528 * 1.35
  }
  const line = (y: number) => {
    doc.setDrawColor('#DCE4DE')
    doc.setLineWidth(0.25)
    doc.line(18, y, 192, y)
  }
  const header = () => {
    doc.setFillColor(ink)
    doc.rect(0, 0, 210, 16, 'F')
    text('luma. / GAYRİMENKUL DOSYASI', 18, 10, 9, '#FFFFFF')
    doc.setFontSize(7)
    doc.setTextColor('#CEE1DB')
    doc.text(c.documentId, 192, 10, { align: 'right' })
  }
  const image = (snapshot: ViewSnapshot, x: number, y: number, width: number, height: number) => {
    doc.setFillColor(light)
    doc.rect(x, y, width, height, 'F')
    const ratio = Math.min(width / snapshot.width, height / snapshot.height)
    const w = snapshot.width * ratio,
      h = snapshot.height * ratio
    doc.addImage(snapshot.dataUrl, 'PNG', x + (width - w) / 2, y + (height - h) / 2, w, h, undefined, 'FAST')
  }
  const stat = (label: string, value: string, x: number, y: number) => {
    text(label, x, y, 8, muted)
    text(value, x, y + 9, 15)
  }
  header()
  text(o.purpose === 'annex' ? 'DEMO / SÖZLEŞME EKİ TASLAĞI' : 'DEMO / MÜŞTERİ BİLGİ FÖYÜ', 18, 28, 8, copper)
  text(`${c.project.name} / ${c.unit.number}`, 18, 42, 24)
  text(
    `${c.project.district}, İzmir  /  ${c.unit.block} Blok  /  ${c.unit.floor}. kat  /  ${c.unit.rooms}`,
    18,
    53,
    11,
    muted,
  )
  image(c.model, 18, 63, 174, 108)
  text(`3B görünüm - turkuaz işaret: ${c.unit.number} / Özgün konsept model`, 18, 177, 8, muted)
  text(
    'Görsel mevcut modelden alınmıştır; mimari uygulama veya gerçek manzara belgesi değildir.',
    18,
    183,
    7.5,
    muted,
    174,
  )
  stat('NET ALAN', `${c.unit.netArea} m²`, 18, 199)
  stat('BRÜT ALAN', `${c.unit.grossArea} m²`, 79, 199)
  stat('DAİRE TİPİ', c.unit.rooms, 140, 199)
  line(214)
  stat('CEPHE', c.unit.aspect, 18, 225)
  stat('SATIŞ DURUMU', c.unit.status, 79, 225)
  stat('KAT / BLOK', `${c.unit.floor}. kat / ${c.unit.block}`, 140, 225)
  line(241)
  text('ÖRNEK SATIŞ FİYATI', 18, 251, 8, muted)
  text(`${new Intl.NumberFormat('tr-TR').format(c.unit.price)} TL`, 18, 263, 23)
  text('Temsili fiyat; satış teklifi değildir.', 116, 262, 8, copper, 76)

  doc.addPage()
  header()
  text('02 / KONUM VE YAKIN ÇEVRE', 18, 28, 8, copper)
  text('Yaşamın çevresi', 18, 40, 22)
  image(c.map, 18, 49, 174, 93)
  text('Altlık: OpenFreeMap / © OpenMapTiles / © OpenStreetMap katkıcıları (ODbL)', 18, 149, 7, muted)
  doc.link(18, 144, 174, 7, { url: 'https://www.openstreetmap.org/copyright' })
  text(
    'Proje işareti bölgesel ve temsilidir. Parsel, tapu veya gerçek adres gösterimi değildir.',
    18,
    155,
    7.5,
    copper,
    174,
  )
  text(`${c.project.district}, İzmir`, 18, 168, 12)
  const [lon, lat] = c.project.regionalPoint
  text(`Temsili nokta / WGS84: ${lat.toFixed(5)}° K, ${lon.toFixed(5)}° D`, 18, 175, 8, muted)
  text('Konumu OpenStreetMap üzerinde aç', 18, 182, 8, '#18787B')
  doc.link(18, 178, 100, 6, {
    url: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`,
  })
  text(c.nearbyMode === 'sample' ? 'Örnek donatı uzaklıkları' : 'Donatı uzaklık tablosu', 18, 195, 13)
  const categoryLabel =
    c.category === 'all'
      ? 'Tüm kategoriler'
      : (categories.find((k) => k.id === c.category)?.label ?? c.category)
  text(
    `${c.radius} km yarıçap / ${categoryLabel} / Kuş uçuşu; rota veya süre değildir.`,
    18,
    202,
    7.5,
    muted,
    174,
  )
  let y = 208
  const tableHeader = () => {
    doc.setFillColor(ink)
    doc.rect(18, y, 174, 9, 'F')
    text('Kategori', 21, y + 6, 8, '#FFFFFF')
    text('Nokta / kaynak durumu', 54, y + 6, 8, '#FFFFFF')
    text('Mesafe', 168, y + 6, 8, '#FFFFFF')
    y += 9
  }
  tableHeader()
  const rows =
    c.nearbyMode === 'sample'
      ? c.nearby.map((p) => ({
          category: categories.find((k) => k.id === p.category)!.label,
          name: p.name,
          distance: formatDistance(p.distance),
        }))
      : categories.map((k) => ({ category: k.label, name: 'Veri bağlı değil', distance: '-' }))
  for (const [index, row] of rows.entries()) {
    doc.setFontSize(8)
    const nameLines: string[] = doc.splitTextToSize(row.name, 108)
    const height = Math.max(8, nameLines.length * 4 + 3)
    if (y + height > 265) {
      doc.addPage()
      header()
      text('Yakın çevre / devam', 18, 32, 18)
      y = 43
      tableHeader()
    }
    doc.setFillColor(index % 2 ? '#FFFFFF' : light)
    doc.rect(18, y, 174, height, 'F')
    text(row.category, 21, y + 5.5, 8)
    text(row.name, 54, y + 5.5, 8, ink, 108)
    text(row.distance, 168, y + 5.5, 8, ink)
    y += height
  }
  text(
    c.nearbyMode === 'sample'
      ? 'Bu tablodaki donatılar ve konumları örnektir. Gerçek kurum, durak veya ulaşım yakınlığı iddiası taşımaz.'
      : 'Gerçek donatı kaynağı henüz bağlanmadı. Eksik veri, çevrede donatı olmadığı anlamına gelmez.',
    18,
    y + 7,
    7.5,
    copper,
    174,
  )

  doc.addPage()
  header()
  text('03 / PLAN VE BELGE REFERANSLARI', 18, 28, 8, copper)
  text(`${c.unit.number} / Yerleşim şeması`, 18, 40, 22)
  const plan = getUnitPlan(c.unit)
  if (plan) {
    const scale = 120 / 680,
      top = 51
    for (const room of plan.spaces) {
      const x = 18 + room.x * scale,
        y = top + (room.y + 25) * scale,
        w = room.width * scale,
        h = room.height * scale
      doc.setFillColor(room.kind === 'outdoor' ? '#E2ECDD' : room.kind === 'living' ? '#DDECE9' : '#F2F0E8')
      doc.setDrawColor('#7B9188')
      doc.setLineWidth(0.3)
      doc.rect(x, y, w, h, 'FD')
      text(room.name, x + 2, y + Math.min(6, h / 2), 6.5, ink, w - 4)
    }
    for (const opening of plan.openings) {
      doc.setDrawColor(opening.kind === 'window' ? '#46A1AA' : '#FFFFFF')
      doc.setLineWidth(opening.kind === 'window' ? 0.8 : 1.3)
      doc.line(
        18 + opening.x1 * scale,
        top + (opening.y1 + 25) * scale,
        18 + opening.x2 * scale,
        top + (opening.y2 + 25) * scale,
      )
    }
    text(plan.label, 151, 64, 13)
    text(`${c.unit.rooms}\n${c.unit.netArea} m² net\n${c.unit.grossArea} m² brüt`, 151, 77, 9, muted, 41)
    text('Ölçeksiz şema. Coğrafi kuzey ve gerçek manzara göstermez.', 151, 108, 8, copper, 41)
  } else text('Bu daire için plan şeması eklenmedi.', 18, 85, 12, muted)
  text(
    'Duvar, kapı ve pencere yerleri temsilidir. Alanlar örnek envanterden gelir; bu şemadan ölçülemez.',
    18,
    155,
    8,
    muted,
    174,
  )
  line(169)
  text(o.purpose === 'annex' ? 'Ek doküman referansları' : 'Dosya referansları', 18, 180, 14)
  let rowY = 190
  const fieldRow = (leftLabel: string, left: string, rightLabel: string, right: string) => {
    text(leftLabel, 18, rowY, 7.5, muted)
    text(rightLabel, 109, rowY, 7.5, muted)
    const a = text(left || 'Belirtilmedi', 18, rowY + 6, 9, ink, 80)
    const b = text(right || 'Belirtilmedi', 109, rowY + 6, 9, ink, 83)
    rowY = Math.max(a, b) + 6
  }
  fieldRow('MÜŞTERİ / ALICI', o.customer, 'HAZIRLAYAN', o.advisor)
  fieldRow('DOSYA / SÖZLEŞME REFERANSI', o.reference, 'EK NUMARASI', o.appendix)
  doc.setFontSize(8.5)
  const note = o.notes || 'Ek not eklenmedi.'
  const noteHeight = doc.splitTextToSize(note, 174).length * 8.5 * 0.3528 * 1.35
  if (rowY + 6 + noteHeight > 253) {
    doc.addPage()
    header()
    text('Belge notları / devam', 18, 32, 18)
    rowY = 46
  }
  text('BELGE NOTU', 18, rowY, 7.5, muted)
  const notesEnd = text(note, 18, rowY + 6, 8.5, ink, 174)
  text(
    'Kontrol bekleyenler: gerçek adres/parsel, mimari alan/plan, satış fiyatı ve donatı kaynakları.',
    18,
    Math.max(notesEnd + 5, 263),
    7.3,
    copper,
    174,
  )

  const pages = doc.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    line(279)
    text('DEMO / TASLAK - Doğrulanmadan gerçek sözleşme eki olarak kullanılmamalıdır.', 18, 285, 7, copper)
    text(`${date} (İstanbul) / ${c.documentId}`, 18, 291, 6.5, muted)
    doc.setFontSize(7)
    doc.setTextColor(muted)
    doc.text(`${i} / ${pages}`, 192, 291, { align: 'right' })
  }
  return new Uint8Array(doc.output('arraybuffer'))
}
