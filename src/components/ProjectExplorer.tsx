import {
  ArrowUpRight,
  Box,
  BusFront,
  GraduationCap,
  HeartPulse,
  MapPin,
  TrainFront,
  Trees,
  X,
} from 'lucide-react'
import { config } from '../config'
import { currency } from '../domain/portfolio'
import { categories, formatDistance, type Category, type NearbyResult } from '../domain/nearby'
import type { Project } from '../domain/types'
const icons = { bus: BusFront, metro: TrainFront, education: GraduationCap, health: HeartPulse, park: Trees }
interface Props {
  project: Project
  category: Category | 'all'
  radius: number
  points: NearbyResult[]
  allPoints: NearbyResult[]
  selectedPoi: NearbyResult | null
  onCategory: (value: Category | 'all') => void
  onRadius: (value: number) => void
  onSelectPoi: (id: string | null) => void
  onClose: () => void
  onOpen: () => void
  sampleMode: boolean
  onSampleMode: () => void
}
export function ProjectExplorer(props: Props) {
  const { project, points, selectedPoi } = props
  return (
    <aside className="project-explorer" aria-label={`${project.name} proje ve çevre bilgileri`}>
      <header className="explorer-cover">
        <img src={config.images[project.image]} alt="Temsili mimari konsept" />
        <span>PROJE & ÇEVRESİ</span>
        <button className="explorer-close" aria-label="Proje seçimini temizle" onClick={props.onClose}>
          <X size={19} />
        </button>
      </header>
      <div className="explorer-content">
        <div className="explorer-title">
          <p>
            <MapPin size={13} />
            {project.district}, İzmir <span>Temsili konum</span>
          </p>
          <h2>{project.name}</h2>
          <span>
            {project.rooms.join(' · ')} / {project.areaRange.join('–')} m² net
          </span>
        </div>
        <div className="explorer-price">
          <div>
            <small>Başlangıç fiyatı · demo</small>
            <strong>{currency(project.minPrice)}</strong>
          </div>
          <span>
            {project.availableUnits} / {project.totalUnits}
            <small>uygun birim</small>
          </span>
        </div>
        <button className="primary full" onClick={props.onOpen}>
          {project.modelUrl ? <Box size={17} /> : <ArrowUpRight size={17} />}{' '}
          {project.modelUrl ? '3B daireleri keşfet' : 'Proje dosyasını aç'}
          <ArrowUpRight size={17} />
        </button>
        <div className="explorer-facts">
          <span>{project.delivery}</span>
          <span>{project.deliveryDate}</span>
        </div>
        <section className="nearby-section" aria-labelledby="nearby-title">
          <div className="nearby-heading">
            <div>
              <span className="eyebrow">GÜNLÜK YAŞAM</span>
              <h3 id="nearby-title">Yakın çevre</h3>
            </div>
            <label>
              Yarıçap
              <select
                aria-label="Yakın çevre arama yarıçapı"
                value={props.radius}
                onChange={(e) => props.onRadius(Number(e.target.value))}
              >
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
              </select>
            </label>
          </div>
          <div className="nearby-categories" role="group" aria-label="Çevre katmanları">
            <button aria-pressed={props.category === 'all'} onClick={() => props.onCategory('all')}>
              Tümü
            </button>
            {categories.map((c) => {
              const Icon = icons[c.id]
              return (
                <button
                  key={c.id}
                  aria-pressed={props.category === c.id}
                  onClick={() => props.onCategory(c.id)}
                >
                  <Icon size={14} />
                  {c.label}
                  <span>
                    {props.sampleMode ? props.allPoints.filter((p) => p.category === c.id).length : '—'}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="nearby-connection">
            <strong>{props.sampleMode ? 'Örnek akış açık' : 'Donatı verisi henüz bağlı değil'}</strong>
            <p>
              {props.sampleMode
                ? 'Bu noktalar yalnızca etkileşimi gösterir. Gerçek durak, metro veya kurum konumları değildir.'
                : 'Kategori, liste ve harita seçimi hazır. Gerçek çevre verisini sonraki aşamada bağlayacağız.'}
            </p>
            <button onClick={props.onSampleMode}>
              {props.sampleMode ? 'Örnek noktaları kapat' : 'Örnek akışı dene'}
            </button>
          </div>
          {props.sampleMode && (
            <p className="nearby-summary" role="status">
              {points.length} örnek nokta · {props.radius} km içinde · konumlar temsilidir.
            </p>
          )}
          {selectedPoi && (
            <div className="poi-focus" aria-live="polite">
              <div>
                <span>HARİTADA SEÇİLİ · ÖRNEK</span>
                <strong>{selectedPoi.name}</strong>
                <p>{formatDistance(selectedPoi.distance)} · temsili kuş uçuşu mesafe</p>
              </div>
              <button aria-label="Çevre noktası seçimini temizle" onClick={() => props.onSelectPoi(null)}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="nearby-list">
            {points.map((p) => {
              const c = categories.find((c) => c.id === p.category)!
              const Icon = icons[p.category]
              return (
                <button
                  key={p.id}
                  aria-pressed={selectedPoi?.id === p.id}
                  aria-label={`${p.name}, ${formatDistance(p.distance)}, haritada göster`}
                  onClick={() => props.onSelectPoi(p.id)}
                >
                  <span className="poi-icon" style={{ color: c.color }}>
                    <Icon size={18} />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{c.label}</small>
                  </span>
                  <b>{formatDistance(p.distance)}</b>
                </button>
              )
            })}
          </div>
          {!points.length && props.sampleMode && (
            <div className="nearby-empty">
              <MapPin size={22} />
              <strong>Bu kapsamda örnek nokta yok.</strong>
              <p>Yarıçapı genişletebilir veya başka bir kategori seçebilirsiniz.</p>
            </div>
          )}
          <p className="nearby-source">
            Gerçek harita altlığı ile örnek donatı işaretleri ayrı katmanlardır. Gerçek veriler bağlandığında
            kaynak ve güncelleme tarihi burada gösterilecek. Mesafeler rota veya ulaşım süresi değildir.
          </p>
        </section>
      </div>
    </aside>
  )
}
