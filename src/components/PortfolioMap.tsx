import { useEffect, useRef, useState, type RefObject } from 'react'
import { type GeoJSONSource, Map as MapInstance, ScaleControl, setWorkerUrl } from 'maplibre-gl'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { LocateFixed, Plus, Minus, Layers, RefreshCw, Navigation2, MapPin, LoaderCircle } from 'lucide-react'
import { config } from '../config'
import { toGeoJSON } from '../domain/portfolio'
import type { Bounds, Project } from '../domain/types'
import { nearbyGeoJSON, type NearbyResult } from '../domain/nearby'
import type { CaptureView } from '../domain/report'
import { diagnosticsEnabled } from '../performance/diagnostics'

// MapLibre 6 ships its worker separately. Vite must bundle the worker and its
// shared imports, not resolve them relative to the optimized main module.
setWorkerUrl(workerUrl)

interface Props {
  projects: Project[]
  selected: Project | null
  onSelect: (id: string) => void
  onSearchArea: (bounds: Bounds) => void
  areaActive: boolean
  onClearArea: () => void
  nearby: NearbyResult[]
  selectedPoi: NearbyResult | null
  onSelectPoi: (id: string) => void
  captureRef?: RefObject<CaptureView | null>
}
export function PortfolioMap(props: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapInstance | null>(null)
  const latest = useRef(props)
  latest.current = props
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [moved, setMoved] = useState(false)
  const [styleName, setStyleName] = useState<'positron' | 'bright'>('positron')
  const [retry, setRetry] = useState(0)
  const [readyVersion, setReadyVersion] = useState(0)
  const camera = useRef({ center: config.map.center, zoom: config.map.zoom })

  useEffect(() => {
    if (!props.captureRef) return
    const instance = map.current
    props.captureRef.current =
      status === 'ready' && instance
        ? () =>
            new Promise((resolve, reject) => {
              let done = false
              let timeout = 0
              const finish = (error?: Error) => {
                if (done) return
                done = true
                clearTimeout(timeout)
                instance.off('idle', start)
                instance.off('render', capture)
                instance.off('remove', removed)
                if (error) {
                  reject(error)
                  return
                }
                try {
                  const canvas = instance.getCanvas()
                  resolve({
                    dataUrl: canvas.toDataURL('image/png'),
                    width: canvas.width,
                    height: canvas.height,
                    capturedAt: new Date().toISOString(),
                  })
                } catch {
                  reject(new Error('Harita görüntüsü alınamadı. Altlığı yeniden yükleyin.'))
                }
              }
              const capture = () => finish()
              const removed = () => finish(new Error('Harita kapatıldı. Yeniden deneyin.'))
              const start = () => {
                instance.off('idle', start)
                instance.once('render', capture)
                instance.triggerRepaint()
              }
              timeout = window.setTimeout(
                () =>
                  finish(
                    new Error(
                      'Harita henüz hazır değil. İnternet bağlantısını kontrol edip yeniden deneyin.',
                    ),
                  ),
                12000,
              )
              instance.once('remove', removed)
              if (instance.loaded() && !instance.isMoving()) start()
              else instance.once('idle', start)
            })
        : null
    return () => {
      if (props.captureRef) props.captureRef.current = null
    }
  }, [status, readyVersion, props.captureRef])

  useEffect(() => {
    if (!container.current) return
    let instance: MapInstance
    let gone = false
    let mapFailureReported = false
    setStatus('loading')
    try {
      instance = new MapInstance({
        container: container.current,
        style: styleName === 'positron' ? config.map.style : 'https://tiles.openfreemap.org/styles/bright',
        center: camera.current.center,
        zoom: camera.current.zoom,
        minZoom: 7,
        maxZoom: config.map.maxZoom,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
      })
    } catch (error) {
      console.error('[Luma map] Initialization failed', error)
      setStatus('error')
      return
    }
    map.current = instance
    instance.addControl(new ScaleControl({ unit: 'metric' }), 'bottom-left')
    const timeout = window.setTimeout(() => {
      if (!gone && !instance.loaded()) setStatus('error')
    }, 15000)
    instance.on('load', () => {
      if (gone) return
      clearTimeout(timeout)
      instance.addSource('projects', {
        type: 'geojson',
        data: toGeoJSON(latest.current.projects),
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 38,
      })
      instance.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'projects',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#122333',
          'circle-radius': 23,
          'circle-stroke-width': 5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.7,
        },
      })
      instance.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'projects',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 14,
        },
        paint: { 'text-color': '#ffffff' },
      })
      instance.addLayer({
        id: 'project-halo',
        type: 'circle',
        source: 'projects',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 19,
          'circle-color': '#b8753b',
          'circle-opacity': ['case', ['==', ['get', 'id'], latest.current.selected?.id ?? ''], 0.2, 0],
        },
      })
      instance.addLayer({
        id: 'project-points',
        type: 'circle',
        source: 'projects',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 8,
          'circle-color': [
            'case',
            ['==', ['get', 'id'], latest.current.selected?.id ?? ''],
            '#b8753b',
            '#122333',
          ],
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })
      instance.addLayer({
        id: 'project-labels',
        type: 'symbol',
        source: 'projects',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'priceLabel'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 13,
          'text-anchor': 'bottom',
          'text-offset': [0, -1.2],
          'text-padding': 5,
          'text-allow-overlap': false,
        },
        paint: { 'text-color': '#122333', 'text-halo-color': '#ffffff', 'text-halo-width': 3 },
      })
      instance.addLayer({
        id: 'project-hit-area',
        type: 'circle',
        source: 'projects',
        filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 22, 'circle-opacity': 0 },
      })
      instance.addSource('nearby', {
        type: 'geojson',
        data: nearbyGeoJSON(latest.current.nearby, latest.current.selectedPoi?.id ?? null),
      })
      instance.addLayer({
        id: 'nearby-halo',
        type: 'circle',
        source: 'nearby',
        paint: {
          'circle-radius': 22,
          'circle-color': '#138c8e',
          'circle-opacity': ['case', ['get', 'selected'], 0.22, 0],
        },
      })
      instance.addLayer({
        id: 'nearby-points',
        type: 'circle',
        source: 'nearby',
        paint: {
          'circle-radius': ['case', ['get', 'selected'], 14, 10],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 2,
        },
      })
      instance.addLayer({
        id: 'nearby-symbols',
        type: 'symbol',
        source: 'nearby',
        layout: {
          'text-field': ['get', 'symbol'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#ffffff' },
      })
      instance.addLayer({
        id: 'nearby-label',
        type: 'symbol',
        source: 'nearby',
        filter: ['==', ['get', 'selected'], true],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 13,
          'text-anchor': 'top',
          'text-offset': [0, 1.6],
          'text-max-width': 18,
          'text-allow-overlap': true,
        },
        paint: { 'text-color': '#17343e', 'text-halo-color': '#ffffff', 'text-halo-width': 3 },
      })
      instance.addLayer({
        id: 'nearby-hit',
        type: 'circle',
        source: 'nearby',
        paint: { 'circle-radius': 19, 'circle-opacity': 0 },
      })
      if (diagnosticsEnabled) {
        performance.clearMarks('luma-map-ready')
        performance.mark('luma-map-ready')
      }
      setStatus('ready')
      setReadyVersion((n) => n + 1)
    })
    const selectProject = (e: import('maplibre-gl').MapLayerMouseEvent) => {
      if (instance.queryRenderedFeatures(e.point, { layers: ['nearby-hit'] }).length) return
      const id = e.features?.[0]?.properties?.id
      if (typeof id === 'string') latest.current.onSelect(id)
    }
    instance.on('click', 'project-hit-area', selectProject)
    instance.on('click', 'project-labels', selectProject)
    instance.on('click', 'nearby-hit', (e) => {
      const id = e.features?.[0]?.properties?.id
      if (typeof id === 'string') latest.current.onSelectPoi(id)
    })
    instance.on('click', 'clusters', async (e) => {
      const feature = e.features?.[0]
      if (!feature || feature.geometry.type !== 'Point') return
      const source = instance.getSource('projects') as GeoJSONSource
      try {
        const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id)
        if (!gone)
          instance.easeTo({ center: feature.geometry.coordinates as [number, number], zoom, duration: 650 })
      } catch {}
    })
    for (const layer of ['project-hit-area', 'project-labels', 'clusters', 'nearby-hit']) {
      instance.on('mouseenter', layer, () => {
        instance.getCanvas().style.cursor = 'pointer'
      })
      instance.on('mouseleave', layer, () => {
        instance.getCanvas().style.cursor = ''
      })
    }
    instance.on('dragend', () => setMoved(true))
    instance.on('zoomend', (e) => {
      if (e.originalEvent) setMoved(true)
    })
    instance.on('error', (event) => {
      if (gone || instance.isStyleLoaded()) return
      if (!mapFailureReported) console.error('[Luma map]', event.error)
      mapFailureReported = true
      setStatus('error')
    })
    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(container.current)
    return () => {
      gone = true
      camera.current = {
        center: instance.getCenter().toArray() as [number, number],
        zoom: instance.getZoom(),
      }
      clearTimeout(timeout)
      observer.disconnect()
      instance.remove()
      map.current = null
    }
  }, [styleName, retry])

  useEffect(() => {
    const source = map.current?.getSource('projects') as GeoJSONSource | undefined
    source?.setData(toGeoJSON(props.projects))
  }, [props.projects, readyVersion])

  useEffect(() => {
    const instance = map.current
    if (!instance?.getLayer('project-points')) return
    instance.setPaintProperty('project-points', 'circle-color', [
      'case',
      ['==', ['get', 'id'], props.selected?.id ?? ''],
      '#b8753b',
      '#122333',
    ])
    instance.setPaintProperty('project-halo', 'circle-opacity', [
      'case',
      ['==', ['get', 'id'], props.selected?.id ?? ''],
      0.2,
      0,
    ])
  }, [props.selected, readyVersion])

  useEffect(() => {
    const source = map.current?.getSource('nearby') as GeoJSONSource | undefined
    if (!source) return
    source.setData(nearbyGeoJSON(props.nearby, props.selectedPoi?.id ?? null))
  }, [props.nearby, props.selectedPoi, readyVersion])

  useEffect(() => {
    const instance = map.current
    if (!instance?.getSource('nearby')) return
    if (!props.selected) return
    const coords = [
      props.selected.regionalPoint,
      ...(props.selectedPoi ? [props.selectedPoi.coordinates] : props.nearby.map((p) => p.coordinates)),
    ]
    const xs = coords.map((c) => c[0]),
      ys = coords.map((c) => c[1])
    instance.fitBounds(
      [
        [Math.min(...xs), Math.min(...ys)],
        [Math.max(...xs), Math.max(...ys)],
      ],
      {
        padding: { top: 115, right: 70, bottom: 75, left: 60 },
        maxZoom: 14,
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 800,
      },
    )
  }, [props.nearby, props.selectedPoi, props.selected, readyVersion])

  const reset = () => {
    latest.current.onClearArea()
    setMoved(false)
    map.current?.flyTo({
      center: config.map.center,
      zoom: config.map.zoom,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      duration: 700,
    })
  }
  return (
    <section className="map-surface" aria-label="İzmir bölgesel proje haritası">
      <div className="map-canvas" ref={container} />
      <div className={`map-heading ${props.selected ? 'map-heading-context' : ''}`}>
        <span>
          <MapPin size={16} /> {props.selected ? `${props.selected.district} / İZMİR` : 'İZMİR'}
        </span>
        <h2>
          {props.selected ? (
            props.selected.name
          ) : (
            <>
              Yeni bir yaşamın
              <br />
              yerini keşfedin.
            </>
          )}
        </h2>
        <p>
          {props.selected ? 'Projeyi ve çevresindeki yaşamı keşfedin.' : 'Gerçek çevre. Yeni olasılıklar.'}
        </p>
      </div>
      <div className="map-mode">
        <span className="map-mode-active">
          <Navigation2 size={15} /> 2B Harita
        </span>
        <span>Bölgesel görünüm</span>
      </div>
      <div className="map-tools">
        <button
          title="Yakınlaştır"
          aria-label="Haritayı yakınlaştır"
          onClick={() => {
            map.current?.zoomIn()
            setMoved(true)
          }}
        >
          <Plus size={20} />
        </button>
        <button
          title="Uzaklaştır"
          aria-label="Haritayı uzaklaştır"
          onClick={() => {
            map.current?.zoomOut()
            setMoved(true)
          }}
        >
          <Minus size={20} />
        </button>
        <span className="tool-divider" />
        <button title="İzmir görünümüne dön" aria-label="İzmir görünümüne dön" onClick={reset}>
          <LocateFixed size={19} />
        </button>
        <button
          title={styleName === 'positron' ? 'Detaylı altlığa geç' : 'Sade altlığa geç'}
          aria-label={styleName === 'positron' ? 'Detaylı altlığa geç' : 'Sade altlığa geç'}
          onClick={() => setStyleName((s) => (s === 'positron' ? 'bright' : 'positron'))}
        >
          <Layers size={19} />
        </button>
      </div>
      {(moved || props.areaActive) && status === 'ready' && (
        <div className="area-search">
          <button
            onClick={() => {
              const b = map.current?.getBounds()
              if (b) props.onSearchArea([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()])
              setMoved(false)
            }}
          >
            <RefreshCw size={14} /> Bu alanda ara
          </button>
          {props.areaActive && (
            <button onClick={reset} className="area-clear">
              Tüm bölgeler
            </button>
          )}
        </div>
      )}
      {status === 'loading' && (
        <div className="map-message" role="status">
          <LoaderCircle className="spin" size={22} />
          <strong>İzmir haritası açılıyor</strong>
          <span>Gerçek harita altlığı yükleniyor.</span>
        </div>
      )}
      {status === 'error' && (
        <div className="map-message error" role="alert">
          <Layers size={22} />
          <strong>Harita şu an yüklenemiyor</strong>
          <span>
            Harita kaynakları yüklenemedi. Yeniden deneyin; soldaki proje listesini kullanmaya devam
            edebilirsiniz.
          </span>
          <button className="primary" onClick={() => setRetry((n) => n + 1)}>
            Yeniden dene
          </button>
        </div>
      )}
      <div className="map-legend">
        <span className="legend-dot" /> Temsili proje konumu <span className="legend-dot selected" /> Seçili
        proje
        {props.nearby.length > 0 && (
          <strong className="sample-map-note">Donatı noktaları örnektir · gerçek konum değildir</strong>
        )}
      </div>
    </section>
  )
}
