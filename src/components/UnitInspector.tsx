import { ArrowLeft, ArrowRight, Compass, Download, FileText, Focus, X } from 'lucide-react'
import { currency } from '../domain/portfolio'
import { getUnitPlan } from '../domain/unit-presentation'
import type { Unit } from '../domain/types'

export function UnitInspector({
  projectName,
  totalFloors,
  unit,
  units,
  onClose,
  onPlan,
  onFocus,
  onSelect,
  onExport,
}: {
  projectName: string
  totalFloors: number
  unit: Unit
  units: Unit[]
  onClose: () => void
  onPlan: () => void
  onFocus: () => void
  onSelect: (id: string) => void
  onExport?: () => void
}) {
  const index = units.findIndex((u) => u.id === unit.id)
  const plan = getUnitPlan(unit)
  return (
    <aside className="unit-inspector" aria-label="Seçili daire bilgileri">
      <header>
        <span>
          <i /> SEÇİLİ DAİRE
        </span>
        <button className="icon-button" aria-label="Daire bilgisini kapat" onClick={onClose}>
          <X size={19} />
        </button>
      </header>
      <div className="inspector-body">
        <div className="inspector-heading" aria-live="polite">
          <span>
            {projectName} / {unit.block} BLOK
          </span>
          <h3>
            {unit.number}
            <small>{unit.rooms}</small>
          </h3>
          <span
            className={`unit-status ${unit.status === 'Uygun' ? 'available' : unit.status === 'Rezerve' ? 'reserved' : 'sold'}`}
          >
            {unit.status}
          </span>
        </div>
        {plan && (
          <button className="inspector-plan" onClick={onPlan} aria-label={`${unit.number} kat planını aç`}>
            <svg viewBox="0 -25 680 555" aria-hidden="true">
              {plan.spaces.map((room, i) => (
                <rect
                  key={room.id}
                  x={room.x}
                  y={room.y}
                  width={room.width}
                  height={room.height}
                  fill={i === 0 ? '#e2ede6' : '#f2eee5'}
                  stroke="#70857d"
                  strokeWidth="2"
                />
              ))}
            </svg>
            <span>
              <FileText size={14} /> Plan şeması <ArrowRight size={14} />
            </span>
          </button>
        )}
        <dl className="inspector-stats">
          <div>
            <dt>Net alan</dt>
            <dd>
              {unit.netArea}
              <small> m²</small>
            </dd>
          </div>
          <div>
            <dt>Brüt alan</dt>
            <dd>
              {unit.grossArea}
              <small> m²</small>
            </dd>
          </div>
          <div>
            <dt>Kat</dt>
            <dd>
              {unit.floor}
              <small> / {totalFloors}</small>
            </dd>
          </div>
          <div>
            <dt>
              <Compass size={13} /> Cephe
            </dt>
            <dd className="aspect-value">{unit.aspect}</dd>
          </div>
        </dl>
        <div className="inspector-price">
          <span>Örnek satış fiyatı</span>
          <strong>{currency(unit.price)}</strong>
          <small>Temsili envanter · gerçek satış teklifi değildir.</small>
        </div>
        <button className="inspector-focus" onClick={onFocus}>
          <Focus size={16} /> Seçili daireye odaklan
        </button>
        <p className="inspector-note">
          Turkuaz alan seçili dairenin temsili hacmidir. Plan şeması ölçeksizdir; mimari uygulama planı
          değildir.
        </p>
      </div>
      <footer className="inspector-actions">
        <button className="primary full" onClick={onPlan}>
          <FileText size={17} /> Plan ve daire dosyası <ArrowRight size={17} />
        </button>
        {onExport && (
          <button className="unit-export-button" onClick={onExport}>
            <Download size={16} /> PDF bilgi föyü / ek taslağı
          </button>
        )}
        <div className="inspector-navigation">
          <button
            aria-label="Önceki daire"
            disabled={index <= 0}
            onClick={() => onSelect(units[index - 1].id)}
          >
            <ArrowLeft size={17} />
          </button>
          <span>
            {index + 1} / {units.length}
            <small>filtrelenmiş daire</small>
          </span>
          <button
            aria-label="Sonraki daire"
            disabled={index === units.length - 1}
            onClick={() => onSelect(units[index + 1].id)}
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </footer>
    </aside>
  )
}
