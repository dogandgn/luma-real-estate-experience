import { useEffect, useId, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Compass,
  ExternalLink,
  FileText,
  Minus,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react'
import type { Project, Unit } from '../domain/types'
import { currency } from '../domain/portfolio'
import { getUnitLinks, getUnitPlan, safePlanUrl } from '../domain/unit-presentation'
import { publicAsset } from '../utils/public-asset'
import './unit-sheet.css'

interface Props {
  unit: Unit
  project: Project
  visibleUnits: Unit[]
  onSelect: (id: string) => void
  onClose: () => void
  onLocate: () => void
}
export function UnitSheet({ unit, project, visibleUnits, onSelect, onClose, onLocate }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const planTitleId = useId()
  const [zoom, setZoom] = useState(1)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const plan = getUnitPlan(unit)
  const links = getUnitLinks(unit)
  const safeOfficialPlanUrl = safePlanUrl(unit.planUrl)
  const officialPlanUrl = safeOfficialPlanUrl?.startsWith('/')
    ? publicAsset(safeOfficialPlanUrl)
    : safeOfficialPlanUrl
  const index = visibleUnits.findIndex((u) => u.id === unit.id)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  useEffect(() => {
    setZoom(1)
    setSelectedRoom(null)
  }, [unit.id])
  return (
    <dialog
      ref={dialog}
      className="unit-sheet"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <header className="unit-sheet-header">
        <div>
          <span className="eyebrow">{project.name} · DAİRE DOSYASI</span>
          <h2 id={titleId}>
            {unit.number} <span>{unit.rooms}</span>
          </h2>
        </div>
        <div className="unit-stepper">
          <button
            aria-label="Önceki daire"
            disabled={index <= 0}
            onClick={() => onSelect(visibleUnits[index - 1].id)}
          >
            <ArrowLeft size={18} />
          </button>
          <span>
            {index + 1} / {visibleUnits.length}
          </span>
          <button
            aria-label="Sonraki daire"
            disabled={index < 0 || index >= visibleUnits.length - 1}
            onClick={() => onSelect(visibleUnits[index + 1].id)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
        <button className="icon-button" autoFocus aria-label="Daire dosyasını kapat" onClick={onClose}>
          <X size={22} />
        </button>
      </header>
      <div className="unit-sheet-grid">
        <section className="plan-section" aria-label="Şematik daire planı">
          <div className="plan-toolbar">
            <div>
              <span className="eyebrow">2B YERLEŞİM ŞEMASI</span>
              <h3>{plan ? `${plan.label} · ${plan.rooms}` : 'Plan henüz eklenmedi'}</h3>
            </div>
            {plan && (
              <div className="plan-zoom" aria-label="Plan yakınlaştırma araçları">
                <button
                  aria-label="Planı uzaklaştır"
                  disabled={zoom <= 0.75}
                  onClick={() => setZoom((v) => Math.max(0.75, v - 0.25))}
                >
                  <Minus size={16} />
                </button>
                <output aria-label="Plan yakınlaştırma oranı">%{Math.round(zoom * 100)}</output>
                <button
                  aria-label="Planı yakınlaştır"
                  disabled={zoom >= 2}
                  onClick={() => setZoom((v) => Math.min(2, v + 0.25))}
                >
                  <Plus size={16} />
                </button>
                <button aria-label="Plan görünümünü sıfırla" onClick={() => setZoom(1)}>
                  <RotateCcw size={15} />
                </button>
              </div>
            )}
          </div>
          {plan ? (
            <>
              <div
                className="plan-viewport"
                tabIndex={0}
                aria-label="Yakınlaştırılmış planı kaydırabilirsiniz"
              >
                <svg
                  className="floorplan-svg"
                  viewBox="0 -25 680 555"
                  style={{ width: `${zoom * 100}%` }}
                  role="img"
                  aria-labelledby={planTitleId}
                >
                  <title id={planTitleId}>
                    {unit.number} dairesinin {plan.rooms} ölçeksiz yerleşim şeması.{' '}
                    {plan.spaces.map((s) => s.name).join(', ')}. Mimari uygulama planı değildir.
                  </title>
                  {plan.spaces.map((space) => (
                    <g
                      key={space.id}
                      className={`plan-room ${space.kind} ${selectedRoom === space.id ? 'active' : ''}`}
                    >
                      <rect x={space.x} y={space.y} width={space.width} height={space.height} />
                      <text x={space.x + space.width / 2} y={space.y + space.height / 2 + 5}>
                        {space.name}
                      </text>
                    </g>
                  ))}
                  {plan.openings.map((gap, i) => (
                    <g className={`plan-opening ${gap.kind}`} key={i}>
                      <line x1={gap.x1} y1={gap.y1} x2={gap.x2} y2={gap.y2} className="opening-gap" />
                      {gap.kind === 'window' ? (
                        <line x1={gap.x1} y1={gap.y1} x2={gap.x2} y2={gap.y2} className="window-line" />
                      ) : (
                        <path
                          d={
                            gap.x1 === gap.x2
                              ? `M${gap.x1},${gap.y1} h-35 M${gap.x1 - 35},${gap.y1} Q${gap.x1 - 35},${gap.y2} ${gap.x2},${gap.y2}`
                              : `M${gap.x1},${gap.y1} v-35 M${gap.x1},${gap.y1 - 35} Q${gap.x2},${gap.y1 - 35} ${gap.x2},${gap.y2}`
                          }
                        />
                      )}
                    </g>
                  ))}
                </svg>
              </div>
              <div className="plan-room-key" role="group" aria-label="Planda mekânı vurgula">
                {plan.spaces.map((space) => (
                  <button
                    key={space.id}
                    aria-pressed={selectedRoom === space.id}
                    onClick={() => setSelectedRoom((id) => (id === space.id ? null : space.id))}
                  >
                    {space.name}
                  </button>
                ))}
              </div>
              <p className="plan-disclaimer">
                <strong>Ölçeksiz demo şeması.</strong> Duvar, kapı ve pencere yerleri temsilidir. Net/brüt
                alanlar örnek envanterden gelir; bu çizimden ölçülmez. 3B seçim hacmiyle geometrik örtüşme
                iddiası yoktur.
              </p>
            </>
          ) : (
            <div className="plan-unavailable">
              <FileText size={30} />
              <p>Bu daireye ait yerleşim şeması bulunmuyor.</p>
            </div>
          )}
        </section>
        <aside className="unit-facts" aria-label="Seçilen dairenin bilgileri">
          <span
            className={`unit-status ${unit.status === 'Uygun' ? 'available' : unit.status === 'Rezerve' ? 'reserved' : 'sold'}`}
          >
            {unit.status}
          </span>
          <p className="unit-price-label">Örnek satış fiyatı</p>
          <strong className="unit-sheet-price">{currency(unit.price)}</strong>
          <dl>
            <div>
              <dt>Blok / kat</dt>
              <dd>
                {unit.block} Blok · {unit.floor}. kat
              </dd>
            </div>
            <div>
              <dt>Daire tipi</dt>
              <dd>{unit.rooms}</dd>
            </div>
            <div>
              <dt>Net / brüt alan</dt>
              <dd>
                {unit.netArea} / {unit.grossArea} m²
              </dd>
            </div>
            <div>
              <dt>Envanter cephesi</dt>
              <dd>
                <Compass size={15} /> {unit.aspect}
              </dd>
            </div>
          </dl>
          <p className="plan-orientation-note">
            Şema çizim yönündedir; coğrafi kuzeyi veya gerçek manzarayı göstermez.
          </p>
          {project.modelUrl && (
            <button className="primary full unit-locate" onClick={onLocate}>
              <Box size={17} /> Bu daireyi 3B'de göster
            </button>
          )}
          <section className="unit-media" aria-label="Daire belgeleri ve sanal turlar">
            <h3>Belgeler ve deneyimler</h3>
            {officialPlanUrl && (
              <a href={officialPlanUrl} target="_blank" rel="noopener noreferrer">
                <FileText size={18} />
                <span>
                  Bağlı plan belgesi<small>Yeni sekmede açılır</small>
                </span>
                <ExternalLink size={15} />
              </a>
            )}
            {links.map((link) => (
              <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={18} />
                <span>
                  {link.label}
                  <small>{link.hostname}</small>
                </span>
                <ArrowRight size={15} />
              </a>
            ))}
            {!officialPlanUrl && <p className="media-missing">Mimari plan belgesi eklenmedi.</p>}
            {!links.length && (
              <p className="media-missing">Sanal tur, Matterport ve AR/VR bağlantıları henüz eklenmedi.</p>
            )}
            <p className="media-privacy">Harici içerikler yalnızca bağlantıya tıkladığınızda açılır.</p>
          </section>
        </aside>
      </div>
      <footer className="unit-sheet-footer">
        Temsili portföy demosu · Gerçek satış ilanı, onaylı mimari plan veya alan taahhüdü değildir.
      </footer>
    </dialog>
  )
}
