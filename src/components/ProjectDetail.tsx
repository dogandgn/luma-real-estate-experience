import { lazy, Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { ArrowLeft, ArrowUpRight, Box, Building2, Check, Compass, FileText, Info, X } from 'lucide-react'
import { config } from '../config'
import { currency, units } from '../domain/portfolio'
import type { Project } from '../domain/types'
import { filterUnits } from '../domain/model-layout'
import { UnitSheet } from './UnitSheet'
import { UnitInspector } from './UnitInspector'
import { ReportDialog } from './ReportDialog'
import type { CaptureView, ReportContext } from '../domain/report'
import type { Category, NearbyResult } from '../domain/nearby'
import './building.css'
import './inspector.css'

const BuildingViewer = lazy(() =>
  import('./BuildingViewer').then((module) => ({ default: module.BuildingViewer })),
)

export function ProjectDetail({
  project,
  onClose,
  captureMap,
  nearby,
  nearbyMode,
  radius,
  category,
}: {
  project: Project
  onClose: () => void
  captureMap: RefObject<CaptureView | null>
  nearby: NearbyResult[]
  nearbyMode: 'sample' | 'unconnected'
  radius: number
  category: Category | 'all'
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<'overview' | 'units' | 'model'>(project.modelUrl ? 'model' : 'overview')
  const [block, setBlock] = useState('')
  const [floor, setFloor] = useState('')
  const [room, setRoom] = useState('')
  const [status, setStatus] = useState('')
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const captureModel = useRef<CaptureView | null>(null)
  const [focusRequest, setFocusRequest] = useState(0)
  useEffect(() => {
    const element = dialog.current
    element?.showModal()
    return () => element?.close()
  }, [])
  const unitList = useRef<HTMLDivElement>(null)
  const inventory = useMemo(() => units.filter((u) => u.projectId === project.id), [project.id])
  const blocks = useMemo(() => [...new Set(inventory.map((unit) => unit.block))].sort(), [inventory])
  const floors = useMemo(
    () => [...new Set(inventory.map((unit) => unit.floor))].sort((a, b) => a - b),
    [inventory],
  )
  const totalFloors = floors.at(-1) ?? 0
  const filters = useMemo(() => ({ block, floor, room, status }), [block, floor, room, status])
  const visibleUnits = useMemo(() => filterUnits(inventory, filters), [inventory, filters])
  const selectedUnit = visibleUnits.find((u) => u.id === selectedUnitId)
  const captureReport = async (): Promise<ReportContext> => {
    if (!selectedUnit || !captureModel.current || !captureMap.current)
      throw new Error('Harita ve 3B model yüklendikten sonra yeniden deneyin.')
    const [model, map] = await Promise.all([captureModel.current(), captureMap.current()])
    return {
      project,
      unit: selectedUnit,
      model,
      map,
      nearby: [...nearby],
      nearbyMode,
      radius,
      category,
      generatedAt: new Date().toISOString(),
      documentId: `LUMA-${selectedUnit.number}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    }
  }
  useEffect(() => {
    if (selectedUnitId && !visibleUnits.some((u) => u.id === selectedUnitId)) setSelectedUnitId(null)
  }, [selectedUnitId, visibleUnits])
  useEffect(() => {
    if (!selectedUnit) setSheetOpen(false)
  }, [selectedUnit])
  useEffect(() => {
    const list = unitList.current
    const element = list?.querySelector<HTMLElement>('[aria-pressed="true"]')
    if (list && element)
      list.scrollTo({
        top: Math.max(0, element.offsetTop - 8),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
  }, [selectedUnitId, tab])
  const resetFilters = () => {
    setBlock('')
    setFloor('')
    setRoom('')
    setStatus('')
  }
  const filterControls = (
    <div className="unit-filters">
      <label>
        Blok
        <select value={block} onChange={(e) => setBlock(e.target.value)}>
          <option value="">Tüm bloklar</option>
          {blocks.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Kat
        <select value={floor} onChange={(e) => setFloor(e.target.value)}>
          <option value="">Tüm katlar</option>
          {floors.map((value) => (
            <option key={value} value={value}>
              {value}. kat
            </option>
          ))}
        </select>
      </label>
      <label>
        Oda
        <select value={room} onChange={(e) => setRoom(e.target.value)}>
          <option value="">Tüm tipler</option>
          {project.rooms.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </label>
      <label>
        Durum
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tüm durumlar</option>
          <option>Uygun</option>
          <option>Rezerve</option>
          <option>Satıldı</option>
        </select>
      </label>
    </div>
  )
  const unitDetail = selectedUnit && (
    <div className="unit-detail">
      <div>
        <strong>
          {selectedUnit.number} · {selectedUnit.rooms}
        </strong>
        <span>
          <Compass size={14} /> {selectedUnit.aspect} cephe · {selectedUnit.floor}. kat
        </span>
        <span>
          {selectedUnit.netArea} m² net / {selectedUnit.grossArea} m² brüt
        </span>
        <strong>{currency(selectedUnit.price)}</strong>
        <span>{selectedUnit.status} · Temsili satış bilgisi</span>
        <button className="unit-sheet-open" onClick={() => setSheetOpen(true)}>
          <FileText size={16} /> Plan ve daire dosyası
        </button>
      </div>
      <button
        className="icon-button"
        aria-label="Daire bilgisini kapat"
        onClick={() => setSelectedUnitId(null)}
      >
        <X size={18} />
      </button>
    </div>
  )
  return (
    <dialog
      ref={dialog}
      className={`project-dialog ${tab === 'model' ? 'model-dialog' : ''}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      aria-labelledby="detail-title"
    >
      <div className="detail-content">
        <header className="detail-header">
          <button className="text-button" onClick={onClose}>
            <ArrowLeft size={18} /> Haritaya dön
          </button>
          <span className="eyebrow">PROJE DOSYASI</span>
          <button className="icon-button" aria-label="Proje detayını kapat" onClick={onClose}>
            <X size={22} />
          </button>
        </header>
        {tab !== 'model' && (
          <div className="detail-hero">
            <img src={config.images[project.image]} alt={`${project.name} için temsili mimari konsept`} />
            <span>Temsili konsept görseli</span>
            <div>
              <p>{project.district} / İzmir</p>
              <h2 id="detail-title">{project.name}</h2>
            </div>
          </div>
        )}
        <nav className="detail-tabs" role="tablist" aria-label="Proje bölümleri">
          {tab === 'model' && <h2 id="detail-title">{project.name}</h2>}
          {project.modelUrl && (
            <button
              id="model-tab"
              role="tab"
              aria-controls="model-panel"
              className={tab === 'model' ? 'active' : ''}
              aria-selected={tab === 'model'}
              onClick={() => setTab('model')}
            >
              <Box size={17} /> 3B Daire seçimi
            </button>
          )}
          <button
            id="overview-tab"
            role="tab"
            aria-controls="overview-panel"
            className={tab === 'overview' ? 'active' : ''}
            aria-selected={tab === 'overview'}
            onClick={() => setTab('overview')}
          >
            Proje hakkında
          </button>
          {project.hasInventory && (
            <button
              id="units-tab"
              role="tab"
              aria-controls="units-panel"
              className={tab === 'units' ? 'active' : ''}
              aria-selected={tab === 'units'}
              onClick={() => setTab('units')}
            >
              Daireler <span>{project.totalUnits}</span>
            </button>
          )}
        </nav>
        {tab === 'model' && project.modelUrl ? (
          <div
            id="model-panel"
            role="tabpanel"
            aria-labelledby="model-tab"
            className={`model-workspace ${selectedUnit ? 'has-unit-selection' : ''}`}
          >
            <aside className="unit-sidebar" aria-label="3B daire listesi ve filtreler">
              <div className="unit-sidebar-top">
                <span className="eyebrow">DAİRE KOLEKSİYONU</span>
                <h3>Size ait bir yer.</h3>
                <p>Blok ve katı seçin, daireleri keşfedin.</p>
                {filterControls}
                <div className="unit-results">
                  <span role="status">
                    <strong>{visibleUnits.length}</strong> / {inventory.length} daire
                  </span>
                  {Object.values(filters).some(Boolean) && (
                    <button onClick={resetFilters}>Filtreleri temizle</button>
                  )}
                </div>
                {floor && <p className="cutaway-note">{floor}. katın üstü modelde gizlenir.</p>}
              </div>
              <div className="model-unit-list" ref={unitList}>
                {visibleUnits.map((u) => (
                  <button
                    key={u.id}
                    aria-label={`${u.number}, ${u.rooms}, ${u.floor}. kat, ${u.status}`}
                    aria-pressed={selectedUnitId === u.id}
                    className={`model-unit-card ${selectedUnitId === u.id ? 'selected' : ''}`}
                    onClick={() => setSelectedUnitId(u.id)}
                  >
                    <div>
                      <strong>{u.number}</strong>
                      <span
                        className={`unit-status ${u.status === 'Uygun' ? 'available' : u.status === 'Rezerve' ? 'reserved' : 'sold'}`}
                      >
                        {u.status}
                      </span>
                    </div>
                    <span>
                      {u.rooms} <i>·</i> {u.netArea} m² net <i>·</i> {u.floor}. kat
                    </span>
                    <div>
                      <b>{currency(u.price)}</b>
                      <ArrowUpRight size={16} />
                    </div>
                  </button>
                ))}
                {visibleUnits.length === 0 && (
                  <div className="inventory-empty">
                    <p>Bu filtrelere uygun daire bulunamadı.</p>
                    <button className="text-button" onClick={resetFilters}>
                      Filtreleri temizle
                    </button>
                  </div>
                )}
              </div>
            </aside>
            <Suspense
              fallback={
                <div className="building-viewer building-loading" role="status">
                  3B görüntüleyici açılıyor…
                </div>
              }
            >
              <BuildingViewer
                captureRef={captureModel}
                projectName={project.name}
                modelUrl={project.modelUrl}
                units={inventory}
                visibleUnits={visibleUnits}
                selected={selectedUnit ?? null}
                filters={filters}
                onSelect={setSelectedUnitId}
                active={!sheetOpen && !reportOpen}
                focusRequest={focusRequest}
              />
            </Suspense>
            {selectedUnit && (
              <UnitInspector
                projectName={project.name}
                totalFloors={totalFloors}
                unit={selectedUnit}
                units={visibleUnits}
                onExport={() => setReportOpen(true)}
                onClose={() => setSelectedUnitId(null)}
                onPlan={() => setSheetOpen(true)}
                onFocus={() => setFocusRequest((v) => v + 1)}
                onSelect={setSelectedUnitId}
              />
            )}
          </div>
        ) : tab === 'overview' ? (
          <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab" className="overview">
            <div>
              <span className="eyebrow">YAŞAMA YER AÇIN</span>
              <h3>
                Her ayrıntısında
                <br />
                size ait bir alan.
              </h3>
              <p>{project.description}</p>
              <div className="amenities">
                {project.amenities.map((a) => (
                  <span key={a}>
                    <Check size={16} />
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div className="project-facts">
              <span className="eyebrow">ÖRNEK SATIŞ BİLGİLERİ</span>
              <strong className="detail-price">{currency(project.minPrice)}</strong>
              <p>başlangıç fiyatıyla</p>
              <dl>
                <div>
                  <dt>Proje tipi</dt>
                  <dd>{project.type}</dd>
                </div>
                <div>
                  <dt>Daire seçenekleri</dt>
                  <dd>{project.rooms.join(' · ')}</dd>
                </div>
                <div>
                  <dt>Net alan</dt>
                  <dd>{project.areaRange.join('–')} m²</dd>
                </div>
                <div>
                  <dt>Uygun / toplam</dt>
                  <dd>
                    {project.availableUnits} / {project.totalUnits}
                  </dd>
                </div>
                <div>
                  <dt>Teslim</dt>
                  <dd>{project.deliveryDate}</dd>
                </div>
              </dl>
              {project.hasInventory && (
                <button className="primary full" onClick={() => setTab('units')}>
                  Daireleri incele <ArrowUpRight size={18} />
                </button>
              )}
            </div>
            <p className="model-note">
              <Building2 size={20} />
              <span>
                <strong>
                  {project.modelUrl
                    ? 'Özgün 3B konsept model hazır.'
                    : 'Bu proje için 3B model henüz eklenmedi.'}
                </strong>
                {project.modelUrl
                  ? ' Modelde daire seçebilirsiniz. Seçim hacimleri mimari kat planı veya alan ölçümü değildir.'
                  : ' Proje bilgilerini inceleyebilirsiniz.'}
              </span>
            </p>
          </div>
        ) : (
          <section id="units-panel" role="tabpanel" aria-labelledby="units-tab" className="inventory">
            <div className="inventory-title">
              <div>
                <span className="eyebrow">{project.name}</span>
                <h3>Size uygun daireyi bulun.</h3>
              </div>
              <span>{visibleUnits.length} daire</span>
            </div>
            <div className="unit-filters">
              <label>
                Blok
                <select value={block} onChange={(e) => setBlock(e.target.value)}>
                  <option value="">Tüm bloklar</option>
                  {blocks.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Kat
                <select value={floor} onChange={(e) => setFloor(e.target.value)}>
                  <option value="">Tüm katlar</option>
                  {floors.map((value) => (
                    <option key={value} value={value}>
                      {value}. kat
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Oda
                <select value={room} onChange={(e) => setRoom(e.target.value)}>
                  <option value="">Tüm tipler</option>
                  {project.rooms.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label>
                Durum
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Tüm durumlar</option>
                  <option>Uygun</option>
                  <option>Rezerve</option>
                  <option>Satıldı</option>
                </select>
              </label>
            </div>
            {unitDetail}
            <div className="unit-table-wrap">
              <table className="unit-table">
                <thead>
                  <tr>
                    <th>Daire</th>
                    <th>Kat</th>
                    <th>Tip / net alan</th>
                    <th>Durum</th>
                    <th>Örnek fiyat</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUnits.map((u) => (
                    <tr key={u.id} className={selectedUnitId === u.id ? 'selected' : ''}>
                      <td>
                        <button onClick={() => setSelectedUnitId(u.id)}>
                          {u.number}
                          <ArrowUpRight size={13} />
                        </button>
                      </td>
                      <td>{u.floor}</td>
                      <td>
                        {u.rooms} <small>{u.netArea} m²</small>
                      </td>
                      <td>
                        <span
                          className={`unit-status ${u.status === 'Uygun' ? 'available' : u.status === 'Rezerve' ? 'reserved' : 'sold'}`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>{currency(u.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visibleUnits.length === 0 && (
              <p className="inventory-empty">Bu filtrelere uygun daire bulunamadı.</p>
            )}
          </section>
        )}
        <footer className="detail-footer">
          <Info size={16} />
          {config.disclaimer}
        </footer>
      </div>
      {sheetOpen && selectedUnit && (
        <UnitSheet
          unit={selectedUnit}
          project={project}
          visibleUnits={visibleUnits}
          onSelect={setSelectedUnitId}
          onClose={() => setSheetOpen(false)}
          onLocate={() => {
            setSheetOpen(false)
            setTab('model')
            setFocusRequest((v) => v + 1)
          }}
        />
      )}
      {reportOpen && selectedUnit && (
        <ReportDialog capture={captureReport} onClose={() => setReportOpen(false)} />
      )}
    </dialog>
  )
}
