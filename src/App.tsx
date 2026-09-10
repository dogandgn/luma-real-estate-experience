import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  CircleHelp,
  Info,
  Layers,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { config } from './config'
import {
  defaultFilters,
  districts,
  filterProjects,
  projects,
  shortPrice,
  validatePortfolio,
} from './domain/portfolio'
import type { Bounds, Filters, Project } from './domain/types'
import { ProjectDetail } from './components/ProjectDetail'
import { ProjectExplorer } from './components/ProjectExplorer'
import { findNearby, visibleNearby, sampleNearby, type Category } from './domain/nearby'
import type { CaptureView } from './domain/report'
import './components/explorer.css'

const PortfolioMap = lazy(() =>
  import('./components/PortfolioMap').then((module) => ({ default: module.PortfolioMap })),
)

export function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [category, setCategory] = useState<Category | 'all'>('all')
  const [radius, setRadius] = useState(3)
  const [poiId, setPoiId] = useState<string | null>(null)
  const [sampleMode, setSampleMode] = useState(false)
  const captureMap = useRef<CaptureView | null>(null)
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [advanced, setAdvanced] = useState(false)
  const [sort, setSort] = useState('featured')
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('list')
  const aboutDialog = useRef<HTMLDialogElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const errors = useMemo(validatePortfolio, [])
  const filtered = useMemo(() => {
    const result = filterProjects(projects, filters, bounds)
    if (sort === 'price') result.sort((a, b) => a.minPrice - b.minPrice)
    if (sort === 'available') result.sort((a, b) => b.availableUnits - a.availableUnits)
    return result
  }, [filters, bounds, sort])
  const selected = filtered.find((p) => p.id === selectedId) ?? null
  const allNearby = useMemo(
    () =>
      selected && sampleMode
        ? findNearby(selected.regionalPoint, radius, sampleNearby(selected.id, selected.regionalPoint))
        : [],
    [selected, radius, sampleMode],
  )
  const nearby = useMemo(() => visibleNearby(allNearby, category), [allNearby, category])
  const selectedPoi = nearby.find((p) => p.id === poiId) ?? null
  useEffect(() => {
    setPoiId(null)
  }, [selectedId, category, radius])
  const exploreProject = (id: string) => {
    setSelectedId(id)
    setCategory('all')
    setRadius(3)
    setMobileTab('map')
  }
  const detail = projects.find((p) => p.id === detailId)
  const activeCount =
    Number(!!filters.district) +
    Number(!!filters.type) +
    Number(!!filters.delivery) +
    Number(filters.maxPrice < defaultFilters.maxPrice) +
    Number(filters.availableOnly)
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((previous) => ({ ...previous, [key]: value }))
  const reset = () => {
    setFilters(defaultFilters)
    setBounds(null)
    setSelectedId(null)
  }
  useEffect(() => {
    if (selectedId && !filtered.some((p) => p.id === selectedId)) setSelectedId(null)
  }, [filtered, selectedId])
  const scrollProjectIntoView = (id: string) => {
    const element = list.current?.querySelector<HTMLElement>(`[data-project="${id}"]`)
    if (element && list.current)
      list.current.scrollTo({
        top: Math.max(0, element.offsetTop - 12),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
  }
  const selectFromMap = (id: string) => {
    setSelectedId(id)
    scrollProjectIntoView(id)
  }
  const showProjectList = () => {
    setMobileTab('list')
    if (selectedId) window.requestAnimationFrame(() => scrollProjectIntoView(selectedId))
  }
  if (errors.length)
    return (
      <main className="data-error">
        <h1>Proje verisi yüklenemedi</h1>
        <p>{errors.join(' · ')}</p>
      </main>
    )
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Luma ana sayfa">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          {config.brand}
          <span className="brand-period">.</span>
        </a>
        <div className="header-divider" />
        <span className="brand-descriptor">GAYRİMENKUL DENEYİMİ</span>
        <nav className="top-navigation" aria-label="Ana gezinme">
          <span className="current">Proje keşfi</span>
        </nav>
        <div className="header-right">
          <span className="demo-badge">PORTFÖY DEMOSU</span>
          <button
            className="about-button"
            aria-label="Demo hakkında"
            onClick={() => aboutDialog.current?.showModal()}
          >
            <CircleHelp size={18} />
            <span>Demo hakkında</span>
          </button>
        </div>
      </header>
      <main className={`workspace mobile-${mobileTab}`}>
        <aside className="sidebar" aria-label="Proje listesi ve filtreler">
          <div className="sidebar-top">
            <div className="breadcrumb">
              Portföy <ChevronRight size={13} />
              <span>İzmir</span>
            </div>
            <div className="title-row">
              <h1>Yaşamı keşfet.</h1>
              <span className="project-total">{projects.length} proje</span>
            </div>
            <p className="intro">Yeni adresiniz için farklı olasılıklar.</p>
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Proje veya bölge ara"
                placeholder="Proje veya bölge arayın"
                value={filters.query}
                onChange={(e) => updateFilter('query', e.target.value)}
              />
              {filters.query && (
                <button aria-label="Aramayı temizle" onClick={() => updateFilter('query', '')}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="main-filters">
              <label>
                <MapPin size={15} />
                <select
                  aria-label="Bölge"
                  value={filters.district}
                  onChange={(e) => updateFilter('district', e.target.value)}
                >
                  <option value="">Tüm bölgeler</option>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
              <button
                className={advanced ? 'filter-toggle active' : 'filter-toggle'}
                aria-expanded={advanced}
                aria-controls="advanced-filters"
                onClick={() => setAdvanced((v) => !v)}
              >
                <SlidersHorizontal size={16} /> Filtreler{activeCount > 0 && <span>{activeCount}</span>}
              </button>
            </div>
            <div className="type-filters" aria-label="Proje tipi">
              {['', 'Konut', 'Villa', 'Karma'].map((type) => (
                <button
                  key={type}
                  className={filters.type === type ? 'active' : ''}
                  aria-pressed={filters.type === type}
                  onClick={() => updateFilter('type', type)}
                >
                  {type || 'Tümü'}
                </button>
              ))}
            </div>
            {advanced && (
              <div id="advanced-filters" className="advanced-filters">
                <label>
                  Teslim durumu
                  <select value={filters.delivery} onChange={(e) => updateFilter('delivery', e.target.value)}>
                    <option value="">Tüm durumlar</option>
                    <option>Teslime hazır</option>
                    <option>İnşaat halinde</option>
                    <option>Planlama</option>
                  </select>
                </label>
                <label className="price-filter">
                  <span>
                    Başlangıç fiyatı en fazla<strong>{shortPrice(filters.maxPrice)}</strong>
                  </span>
                  <input
                    type="range"
                    min="5000000"
                    max="40000000"
                    step="500000"
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
                  />
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) => updateFilter('availableOnly', e.target.checked)}
                  />{' '}
                  Yalnızca uygun birimi olanlar
                </label>
                <button className="text-button" onClick={reset}>
                  Filtreleri temizle
                </button>
              </div>
            )}
          </div>
          <div className="results-toolbar">
            <span role="status" aria-live="polite">
              <strong>{filtered.length}</strong> proje bulundu{bounds ? ' · Bu alan' : ''}
            </span>
            <label>
              <ArrowDownUp size={14} />
              <select aria-label="Projeleri sırala" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Öne çıkanlar</option>
                <option value="price">Fiyat artan</option>
                <option value="available">Uygun birim</option>
              </select>
            </label>
          </div>
          <div className="project-list" ref={list}>
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                active={selectedId === project.id}
                first={index === 0}
                onSelect={() => exploreProject(project.id)}
                onOpen={() => {
                  exploreProject(project.id)
                  setDetailId(project.id)
                }}
              />
            ))}
            {filtered.length === 0 && (
              <div className="empty-state">
                <Search size={30} />
                <h2>Henüz bir eşleşme yok.</h2>
                <p>Fiyat aralığını genişletin veya başka bir bölge deneyin.</p>
                <button className="primary" onClick={reset}>
                  Tüm projeleri göster
                </button>
              </div>
            )}
            {filtered.length > 0 && <p className="list-end">İzmir portföyündeki tüm sonuçlar</p>}
          </div>
          <footer className="sidebar-footer">
            <Info size={15} />
            <span>Proje ve fiyatlar temsili demo verisidir.</span>
          </footer>
        </aside>
        <div className={`map-panel ${selected ? 'has-explorer' : ''}`}>
          <div className="map-stage">
            <Suspense fallback={<div className="map-suspense">Harita hazırlanıyor…</div>}>
              <PortfolioMap
                captureRef={captureMap}
                projects={filtered}
                selected={selected}
                nearby={nearby}
                selectedPoi={selectedPoi}
                onSelectPoi={setPoiId}
                onSelect={selectFromMap}
                onSearchArea={setBounds}
                areaActive={!!bounds}
                onClearArea={() => {
                  setBounds(null)
                  setSelectedId(null)
                }}
              />
            </Suspense>
            {!selected && (
              <div className="map-intro-card">
                <span className="intro-card-icon">
                  <Building2 size={24} />
                </span>
                <div>
                  <strong>Bir bölgeyle başlayın.</strong>
                  <p>Haritadaki işaretlerden veya listeden bir proje seçin.</p>
                </div>
                <ArrowRight size={20} />
              </div>
            )}
            <span className="regional-note">Konumlar bölgeseldir. Parsel sınırı gösterilmez.</span>
          </div>
          {selected && (
            <ProjectExplorer
              project={selected}
              category={category}
              radius={radius}
              points={nearby}
              allPoints={allNearby}
              selectedPoi={selectedPoi}
              sampleMode={sampleMode}
              onSampleMode={() => {
                setSampleMode((v) => !v)
                setPoiId(null)
              }}
              onCategory={setCategory}
              onRadius={setRadius}
              onSelectPoi={setPoiId}
              onClose={() => setSelectedId(null)}
              onOpen={() => setDetailId(selected.id)}
            />
          )}
        </div>
      </main>
      <div className="mobile-switch" role="group" aria-label="Mobil görünüm">
        <button
          className={mobileTab === 'list' ? 'active' : ''}
          aria-pressed={mobileTab === 'list'}
          onClick={showProjectList}
        >
          <Building2 size={17} /> Projeler <span>{filtered.length}</span>
        </button>
        <button
          className={mobileTab === 'map' ? 'active' : ''}
          aria-pressed={mobileTab === 'map'}
          onClick={() => setMobileTab('map')}
        >
          <MapPin size={17} /> Harita
        </button>
      </div>
      {detail && (
        <ProjectDetail
          key={detail.id}
          project={detail}
          captureMap={captureMap}
          nearby={nearby}
          nearbyMode={sampleMode ? 'sample' : 'unconnected'}
          radius={radius}
          category={category}
          onClose={() => setDetailId(null)}
        />
      )}
      <dialog
        className="about-dialog"
        ref={aboutDialog}
        aria-labelledby="about-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) aboutDialog.current?.close()
        }}
      >
        <button
          className="icon-button"
          aria-label="Bilgi penceresini kapat"
          onClick={() => aboutDialog.current?.close()}
        >
          <X size={22} />
        </button>
        <span className="eyebrow">LUMA · ETKİLEŞİMLİ PORTFÖY</span>
        <h2 id="about-title">
          Bir satış deneyiminin
          <br />
          başlangıcı.
        </h2>
        <p>{config.disclaimer}</p>
        <ul>
          <li>
            <Check size={17} /> Gerçek harita, filtreler ve proje listesi
          </li>
          <li>
            <Check size={17} /> Luma Avlu için 48 örnek daire
          </li>
          <li>
            <Layers size={17} /> Özgün 3B model üzerinde daire ve kat seçimi
          </li>
        </ul>
        <p className="small-note">
          Kart görselleri yapay zekâ ile üretilmiş mimari konseptlerdir. 3B model ayrı, özgün bir taslaktır;
          seçim hacimleri mimari kat planı değildir. Altlık harita internet bağlantısı gerektirir.
        </p>
      </dialog>
    </div>
  )
}

function ProjectCard({
  project,
  active,
  first,
  onSelect,
  onOpen,
}: {
  project: Project
  active: boolean
  first: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  return (
    <article data-project={project.id} className={`project-card ${active ? 'selected' : ''}`}>
      <button
        className="card-select"
        onClick={onSelect}
        aria-pressed={active}
        aria-label={`${project.name}, ${project.district}, haritada göster`}
      >
        <div className="card-image">
          <img
            src={config.images[project.image]}
            loading={first ? 'eager' : 'lazy'}
            alt={`${project.type} mimari konsept görseli`}
          />
          <span className={`delivery-badge ${project.delivery === 'Teslime hazır' ? 'ready' : ''}`}>
            {project.delivery === 'Teslime hazır' && <Check size={12} />} {project.delivery}
          </span>
          {project.hasInventory && <span className="featured-badge">ÖRNEK PROJE</span>}
          <span className="image-caption">Konsept görseli</span>
        </div>
        <div className="card-body">
          <div className="card-location">
            <MapPin size={13} />
            {project.district}, İzmir<span>{project.type}</span>
          </div>
          <div className="card-title">
            <h2>{project.name}</h2>
            <ArrowUpRight size={20} />
          </div>
          <div className="card-specs">
            <span>{project.rooms.join(' · ')}</span>
            <span className="spec-divider" />
            <span>{project.areaRange.join('–')} m²</span>
          </div>
        </div>
      </button>
      <div className="card-bottom">
        <div>
          <span className="price-label">Başlangıç fiyatı</span>
          <strong>{shortPrice(project.minPrice)}</strong>
        </div>
        <button onClick={onOpen} className="card-open" aria-label={`${project.name} proje dosyasını aç`}>
          <span className={project.availableUnits ? 'availability' : 'availability sold'}>
            {project.availableUnits ? `${project.availableUnits} uygun birim` : 'Satış tamamlandı'}
          </span>
          <span>
            Proje dosyası <ChevronRight size={15} />
          </span>
        </button>
      </div>
    </article>
  )
}
