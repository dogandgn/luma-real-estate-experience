import { useEffect, useMemo, useRef, useState } from 'react'
import { Box, Download, Moon, Sun } from 'lucide-react'
import { createSalesScene, disposeModel, loadModel, type CameraView } from '../three/sales-scene'
import { units } from '../domain/portfolio'

const views: { id: CameraView; title: string; description: string }[] = [
  { id: 'overview', title: 'Genel görünüm', description: 'İki blok ve ortak avlunun birlikte görünümü.' },
  { id: 'courtyard', title: 'Avlu', description: 'Ortak alanı çevreleyen cepheler ve havuz aksı.' },
  { id: 'A', title: 'Cephe', description: 'A bloğunun balkon, açıklık ve cephe ritmi.' },
]

export function PresentationModel({
  modelUrl,
  projectId,
  active,
}: {
  modelUrl: string
  projectId: string
  active: boolean
}) {
  const inventory = useMemo(() => units.filter((unit) => unit.projectId === projectId), [projectId])
  const host = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ReturnType<typeof createSalesScene> | null>(null)
  const [inView, setInView] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [view, setView] = useState<CameraView>('overview')
  const [evening, setEvening] = useState(false)
  const [retry, setRetry] = useState(0)
  const [materialWarning, setMaterialWarning] = useState(false)
  const [exportStatus, setExportStatus] = useState('')
  const [exporting, setExporting] = useState(false)
  useEffect(() => setExportStatus(''), [view, evening])

  async function exportImage() {
    if (!sceneRef.current || exporting) return
    setExporting(true)
    setExportStatus('')
    try {
      const snapshot = await sceneRef.current.capture('presentation')
      const link = document.createElement('a')
      link.href = snapshot.dataUrl
      link.download = `${projectId}-concept-${view}-${evening ? 'evening' : 'day'}.png`
      link.click()
      setExportStatus('1500 × 950 PNG hazırlandı. Temsili model görüntüsüdür.')
    } catch {
      setExportStatus('Görsel hazırlanamadı. Model hazır olduğunda yeniden deneyin.')
    } finally {
      setExporting(false)
    }
  }
  const settings = useRef({ view, evening })
  settings.current = { view, evening }

  useEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!active || !inView || !host.current) {
      setStatus('idle')
      return
    }
    let gone = false
    let scene: ReturnType<typeof createSalesScene> | null = null
    const abort = new AbortController()
    const timer = window.setTimeout(() => abort.abort(), 20000)
    setStatus('loading')
    setMaterialWarning(false)
    async function initialize() {
      try {
        scene = createSalesScene(
          host.current!,
          () => {},
          () => {},
          () => {
            if (!gone) {
              scene?.setActive(false)
              setStatus('error')
            }
          },
          () => {
            if (!gone) setMaterialWarning(true)
          },
          {
            interactive: false,
            label: 'Luma Avlu mimari sunum modeli. Kamera açılarını aşağıdaki düğmelerle seçin.',
            transitionMs: 1500,
          },
        )
        sceneRef.current = scene
        const response = await fetch(modelUrl, { signal: abort.signal })
        if (!response.ok) throw new Error('Model yüklenemedi')
        const model = await loadModel(await response.arrayBuffer())
        if (gone) {
          disposeModel(model)
          return
        }
        scene.setModel(model, inventory)
        scene.update({
          selected: null,
          visibleIds: new Set(),
          filters: { block: '', floor: '', room: '', status: '' },
          showStatus: false,
          rotating: false,
          detailed: false,
          evening: settings.current.evening,
        })
        scene.view(settings.current.view)
        setStatus('ready')
      } catch {
        if (!gone) {
          scene?.dispose()
          scene = null
          sceneRef.current = null
          setStatus('error')
        }
      } finally {
        clearTimeout(timer)
      }
    }
    void initialize()
    return () => {
      gone = true
      abort.abort()
      clearTimeout(timer)
      scene?.dispose()
      sceneRef.current = null
    }
  }, [modelUrl, inventory, active, inView, retry])

  useEffect(() => {
    if (status !== 'ready') return
    sceneRef.current?.view(view)
  }, [view, status])
  useEffect(() => {
    if (status !== 'ready') return
    sceneRef.current?.update({
      selected: null,
      visibleIds: new Set(),
      filters: { block: '', floor: '', room: '', status: '' },
      showStatus: false,
      rotating: false,
      detailed: false,
      evening,
    })
  }, [evening, status])

  return (
    <div className="presentation-model" aria-label="Aynı modelle mimari keşif">
      <div className="presentation-model-stage">
        <div ref={host} className="presentation-model-canvas" />
        {status !== 'ready' && (
          <div className="presentation-model-message" role="status">
            <Box size={28} strokeWidth={1} />
            <p>
              {status === 'error'
                ? '3B görünüm açılamadı. Sunuma devam edebilir veya yeniden deneyebilirsiniz.'
                : status === 'idle'
                  ? 'Mimari görünüm duraklatıldı.'
                  : 'Projenin 3B modeli hazırlanıyor…'}
            </p>
            {status === 'error' && <button onClick={() => setRetry((n) => n + 1)}>Yeniden dene</button>}
          </div>
        )}
        <span className="presentation-model-badge">ÖZGÜN 3B MODEL / CANLI GÖRÜNÜM</span>
        <button
          className="presentation-model-light"
          disabled={status !== 'ready'}
          aria-pressed={evening}
          onClick={() => setEvening((value) => !value)}
          aria-label="Sunumda akşam ışığı"
        >
          {evening ? <Moon size={16} /> : <Sun size={16} />} {evening ? 'Akşam' : 'Gündüz'}
        </button>
      </div>
      <div className="presentation-model-views" role="group" aria-label="Mimari kamera açıları">
        {views.map((item, index) => (
          <button
            key={item.id}
            aria-pressed={item.id === view}
            disabled={status !== 'ready'}
            onClick={() => setView(item.id)}
          >
            <span>0{index + 1}</span>
            {item.title}
          </button>
        ))}
      </div>
      <p className="presentation-model-caption" aria-live="polite">
        {views.find((item) => item.id === view)?.description} Daire seçimindeki modelin aynısıdır;
        fotogerçekçi render değildir.
        {materialWarning && ' Taş dokusu yüklenemedi; temel malzeme gösteriliyor.'}
      </p>
      <div className="presentation-model-export">
        <button onClick={exportImage} disabled={status !== 'ready' || exporting}>
          <Download size={16} />
          {exporting ? 'Hazırlanıyor…' : 'Bu görünümü indir'}
          <span>PNG</span>
        </button>
        <p role="status">{exportStatus || 'Aynı modelden, seçili kamera ve ışıkla 1500 × 950 görsel.'}</p>
      </div>
    </div>
  )
}
