import { useEffect, useRef, useState, type RefObject } from 'react'
import { Box, Layers, LoaderCircle, Moon, Pause, Play, RotateCcw, Sun } from 'lucide-react'
import type { Unit } from '../domain/types'
import type { UnitFilters } from '../domain/model-layout'
import { createSalesScene, disposeModel, loadModel, type CameraView } from '../three/sales-scene'
import type { CaptureView } from '../domain/report'
import { diagnosticsEnabled, recordTiming } from '../performance/diagnostics'
import { PerformancePanel } from './PerformancePanel'

interface Props {
  projectName: string
  modelUrl: string
  units: Unit[]
  visibleUnits: Unit[]
  selected: Unit | null
  filters: UnitFilters
  onSelect: (id: string) => void
  active?: boolean
  focusRequest?: number
  captureRef?: RefObject<CaptureView | null>
}
export function BuildingViewer(props: Props) {
  const host = useRef<HTMLDivElement>(null)
  const api = useRef<ReturnType<typeof createSalesScene> | null>(null)
  const latest = useRef(props)
  latest.current = props
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [evening, setEvening] = useState(false)
  const [showStatus, setShowStatus] = useState(false)
  const [rotating, setRotating] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [detailed, setDetailed] = useState(false)
  const [materialWarning, setMaterialWarning] = useState(false)
  const changeView = (view: CameraView) => {
    setRotating(false)
    api.current?.view(view)
  }
  const hoverUnit = props.units.find((u) => u.id === hovered)
  const blockCount = new Set(props.units.map((unit) => unit.block)).size
  const floorCount = new Set(props.units.map((unit) => unit.floor)).size
  const measurePerformance = (mode: 'orbit' | 'idle') =>
    api.current?.benchmark(mode) ?? Promise.reject(new Error('3B görüntüleyici hazır değil.'))
  useEffect(() => {
    if (!props.captureRef) return
    props.captureRef.current =
      status === 'ready'
        ? async () => {
            if (!api.current) throw new Error('3B görüntüleyici hazır değil.')
            return api.current.capture()
          }
        : null
    return () => {
      if (props.captureRef) props.captureRef.current = null
    }
  }, [status, props.captureRef])
  useEffect(() => {
    if (!host.current) return
    let gone = false
    let scene: ReturnType<typeof createSalesScene> | null = null
    const abort = new AbortController()
    setStatus('loading')
    setError('')
    setMaterialWarning(false)
    const timeout = window.setTimeout(() => abort.abort(), 20000)
    async function initialize() {
      const started = performance.now()
      try {
        scene = createSalesScene(
          host.current!,
          (id) => latest.current.onSelect(id),
          setHovered,
          () => {
            if (!gone) {
              setStatus('error')
              setError('3B çizim bağlantısı kesildi. Yeniden deneyebilirsiniz.')
            }
          },
          () => {
            if (!gone) setMaterialWarning(true)
          },
        )
        api.current = scene
        const response = await fetch(latest.current.modelUrl, { signal: abort.signal })
        if (!response.ok) throw new Error('Model dosyası yüklenemedi.')
        const model = await loadModel(await response.arrayBuffer())
        if (gone) {
          disposeModel(model)
          return
        }
        scene.setModel(model, latest.current.units)
        recordTiming('modelInitialization', started)
        setStatus('ready')
      } catch (err) {
        if (!gone) {
          console.error('[Luma 3D]', err)
          scene?.dispose()
          scene = null
          api.current = null
          setStatus('error')
          setError(
            '3B model açılamadı. WebGL desteğini kontrol edin veya yeniden deneyin. Daire listesi kullanılabilir.',
          )
        }
      } finally {
        clearTimeout(timeout)
      }
    }
    void initialize()
    return () => {
      gone = true
      abort.abort()
      clearTimeout(timeout)
      scene?.dispose()
      api.current = null
    }
  }, [props.modelUrl, retry])
  useEffect(() => {
    api.current?.update({
      selected: props.selected,
      visibleIds: new Set(props.visibleUnits.map((u) => u.id)),
      filters: props.filters,
      evening,
      showStatus,
      rotating,
      detailed,
    })
  }, [props.selected, props.visibleUnits, props.filters, evening, showStatus, rotating, detailed, status])
  useEffect(() => {
    api.current?.setActive(props.active !== false)
  }, [props.active, status])
  useEffect(() => {
    if (status === 'ready' && props.selected) {
      setRotating(false)
      api.current?.focus(props.selected)
    }
  }, [props.selected, props.focusRequest, status])
  useEffect(() => {
    if (
      status === 'ready' &&
      !props.selected &&
      (props.filters.block === 'A' || props.filters.block === 'B')
    ) {
      setRotating(false)
      api.current?.view(props.filters.block)
    }
  }, [props.filters.block, props.selected, status])
  return (
    <section className={`building-viewer ${evening ? 'evening' : ''}`} aria-label="3B bina ve daire seçimi">
      <div ref={host} className="building-canvas" />
      {diagnosticsEnabled && status === 'ready' && <PerformancePanel measure={measurePerformance} />}
      <div className="building-heading">
        <span className="eyebrow">{props.projectName} · 3B KEŞİF</span>
        <p>
          {blockCount} blok · {floorCount} kat · {props.units.length} daire
        </p>
      </div>
      {props.selected && (
        <div className="scene-selection-label" aria-live="polite">
          <i />
          <strong>{props.selected.number}</strong>
          <span>
            {props.selected.rooms} · {props.selected.floor}. kat · {props.selected.netArea} m²
          </span>
        </div>
      )}
      <div className="camera-presets" role="group" aria-label="Kamera açıları">
        <button disabled={status !== 'ready'} onClick={() => changeView('overview')}>
          Genel
        </button>
        <button disabled={status !== 'ready'} onClick={() => changeView('courtyard')}>
          Avlu
        </button>
        <button disabled={status !== 'ready' || props.filters.block === 'B'} onClick={() => changeView('A')}>
          A Blok
        </button>
        <button disabled={status !== 'ready' || props.filters.block === 'A'} onClick={() => changeView('B')}>
          B Blok
        </button>
      </div>
      <label className="render-quality">
        Görsel kalite
        <select
          aria-label="3B görsel kalite"
          value={detailed ? 'detailed' : 'balanced'}
          onChange={(e) => setDetailed(e.target.value === 'detailed')}
        >
          <option value="balanced">Dengeli</option>
          <option value="detailed">Detaylı gölgeler</option>
        </select>
      </label>
      {materialWarning && (
        <div className="material-warning" role="status">
          Taş dokusu yüklenemedi; sade malzemeyle devam ediliyor.
        </div>
      )}
      <div className="building-tools" aria-label="3B görünüm araçları">
        <button
          title="Başlangıç görünümü"
          aria-label="3B başlangıç görünümüne dön"
          disabled={status !== 'ready'}
          onClick={() => {
            setRotating(false)
            api.current?.overview()
          }}
        >
          <RotateCcw size={18} />
        </button>
        <button
          title="Üstten görünüm"
          aria-label="3B üstten görünüm"
          disabled={status !== 'ready'}
          onClick={() => {
            setRotating(false)
            api.current?.top()
          }}
        >
          <Layers size={18} />
        </button>
        <button
          title="Akşam ışığı"
          aria-label="Akşam ışığı"
          aria-pressed={evening}
          onClick={() => setEvening((v) => !v)}
        >
          {evening ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <button
          title="Otomatik dönüş"
          aria-label="Otomatik dönüş"
          aria-pressed={rotating}
          onClick={() => setRotating((v) => !v)}
        >
          {rotating ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      <div className="building-bottom">
        <button
          className={showStatus ? 'status-toggle active' : 'status-toggle'}
          aria-pressed={showStatus}
          onClick={() => setShowStatus((v) => !v)}
        >
          <Box size={16} /> Satış durumlarını göster
        </button>
        {showStatus && (
          <div className="building-legend">
            <span className="available">Uygun</span>
            <span className="reserved">Rezerve</span>
            <span className="sold">Satıldı</span>
          </div>
        )}
        <p>Sürükleyin: döndür · Kaydırın: yakınlaş · Daireye tıklayın: seç</p>
        <small>Özgün konsept model · Parsel veya mimari uygulama projesi değildir.</small>
      </div>
      {hoverUnit && status === 'ready' && (
        <div className="building-hover" role="status">
          <strong>{hoverUnit.number}</strong> {hoverUnit.rooms} · {hoverUnit.netArea} m² · {hoverUnit.status}
        </div>
      )}
      {status === 'loading' && (
        <div className="building-message" role="status">
          <LoaderCircle className="spin" />
          <strong>3B model hazırlanıyor</strong>
          <span>Bina ve daireler yükleniyor.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="building-message" role="alert">
          <Box />
          <strong>3B görünüm açılamadı</strong>
          <span>{error}</span>
          <button className="primary" onClick={() => setRetry((v) => v + 1)}>
            Yeniden dene
          </button>
        </div>
      )}
    </section>
  )
}
