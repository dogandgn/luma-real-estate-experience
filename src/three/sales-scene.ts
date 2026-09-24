import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createPresentation } from './presentation'
import { pickUnit } from './selection'
import { bindControlInvalidation } from './invalidation'
import { diagnosticsEnabled, recordTiming, summarizeFrames } from '../performance/diagnostics'
import type { ViewSnapshot } from '../domain/report'
import type { Unit } from '../domain/types'
import { unitVolume, type UnitFilters } from '../domain/model-layout'
import { publicAsset } from '../utils/public-asset'
import { presentationCamera } from './presentation-camera'

export interface SceneState {
  selected: Unit | null
  visibleIds: Set<string>
  filters: UnitFilters
  showStatus: boolean
  evening: boolean
  rotating: boolean
  detailed: boolean
}
export type CameraView = 'overview' | 'courtyard' | 'A' | 'B'
export const statusColors = { Uygun: '#518c7b', Rezerve: '#d3a052', Satıldı: '#9b6d72' }
export function disposeModel(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>()
  const materials = new Set<THREE.Material>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.LineSegments)) return
    geometries.add(object.geometry)
    for (const m of Array.isArray(object.material) ? object.material : [object.material]) materials.add(m)
  })
  geometries.forEach((g) => g.dispose())
  materials.forEach((m) => m.dispose())
}

export async function loadModel(buffer: ArrayBuffer) {
  const gltf = await new GLTFLoader().parseAsync(buffer, '')
  return gltf.scene
}

export function createSalesScene(
  host: HTMLDivElement,
  onSelect: (id: string) => void,
  onHover: (id: string | null) => void,
  onLost: () => void,
  onMaterialWarning: () => void,
  options: { interactive?: boolean; label?: string; transitionMs?: number } = {},
) {
  const interactive = options.interactive !== false
  let currentView: CameraView = 'overview'
  const sceneStarted = performance.now()
  let firstFrame = true
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.83
  renderer.domElement.setAttribute(
    'aria-label',
    options.label ?? 'Luma Avlu etkileşimli 3B modeli. Daireleri soldaki listeden de seçebilirsiniz.',
  )
  renderer.domElement.style.touchAction = 'none'
  host.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#e9eeec')
  scene.fog = new THREE.Fog('#e9eeec', 160, 340)
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 400)
  camera.layers.enable(1)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enabled = interactive
  if (!interactive) renderer.domElement.style.touchAction = 'pan-y'
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.zoomSpeed = 0.65
  controls.minDistance = 22
  controls.maxDistance = interactive ? 155 : 220
  controls.maxPolarAngle = Math.PI * 0.475
  controls.minPolarAngle = 0.08
  controls.autoRotateSpeed = 0.55
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const sun = new THREE.DirectionalLight('#fff3dc', 2.5)
  sun.position.set(-40, 55, 35)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 0.5, far: 170 })
  sun.shadow.normalBias = 0.045
  scene.add(sun)
  const fill = new THREE.HemisphereLight('#c7e1f1', '#9a8874', 1.1)
  scene.add(fill)
  const presentation = createPresentation(renderer, scene, camera)
  scene.environment = presentation.day.texture
  scene.environmentIntensity = 0.35
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(800, 800),
    new THREE.MeshStandardMaterial({ color: '#e1e4df', roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.51
  ground.receiveShadow = true
  scene.add(ground)

  let model: THREE.Group | null = null
  let state: SceneState | null = null
  let selectionMeshes: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>[] = []
  let hovered: string | null = null
  let animation: {
    from: THREE.Vector3
    to: THREE.Vector3
    targetFrom: THREE.Vector3
    targetTo: THREE.Vector3
    start: number
  } | null = null
  let disposed = false
  let active = true
  let needsRender = true
  let probe: {
    start: number
    frames: Array<{ time: number; cpu: number; calls: number; triangles: number }>
    cancel: (reason: string) => void
  } | null = null
  const unbindInvalidation = bindControlInvalidation(controls, () => {
    needsRender = true
  })
  let lightMix = 0
  const lightingMaterials = new Set<THREE.MeshStandardMaterial>()
  const stoneMaterials = new Set<THREE.MeshStandardMaterial>()
  let stone: THREE.Texture | null = null
  const outlineBox = new THREE.BoxGeometry(1, 1, 1)
  const selectionOutline = new THREE.LineSegments(
    new THREE.EdgesGeometry(outlineBox),
    new THREE.LineBasicMaterial({
      color: '#0c6b72',
      transparent: true,
      opacity: 1,
      depthTest: true,
      toneMapped: false,
    }),
  )
  outlineBox.dispose()
  selectionOutline.layers.set(1)
  selectionOutline.renderOrder = 4
  selectionOutline.visible = false
  scene.add(selectionOutline)
  // A facade overlay sits outside the balcony rail, so glazing cannot wash out selection.
  const selectionFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      color: '#06999e',
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      toneMapped: false,
      side: THREE.FrontSide,
    }),
  )
  selectionFace.layers.set(1)
  selectionFace.renderOrder = 3
  selectionFace.visible = false
  scene.add(selectionFace)
  const inventoryById = new Map<string, Unit>()
  const defaultTarget = new THREE.Vector3(0, 5, 0)
  function move(to: THREE.Vector3, target: THREE.Vector3) {
    needsRender = true
    if (reducedMotion) {
      camera.position.copy(to)
      controls.target.copy(target)
      controls.update()
      return
    }
    animation = {
      from: camera.position.clone(),
      to,
      targetFrom: controls.target.clone(),
      targetTo: target,
      start: performance.now(),
    }
  }
  function overview() {
    controls.minDistance = 22
    const aspect = Math.max(camera.aspect, 0.3)
    const factor = aspect < 1.2 ? 1.3 : 1
    move(new THREE.Vector3(64 * factor, 49 * factor, 78 * factor), defaultTarget.clone())
  }
  function view(name: CameraView) {
    currentView = name
    if (!interactive) {
      const pose = presentationCamera(name, camera.aspect)
      move(new THREE.Vector3(...pose.position), new THREE.Vector3(...pose.target))
      return
    }
    controls.minDistance = 22
    if (name === 'overview') {
      overview()
      return
    }
    if (name === 'courtyard') {
      move(new THREE.Vector3(2, 12, 48), new THREE.Vector3(0, 6, -3))
      return
    }
    const x = name === 'A' ? -18 : 18
    move(new THREE.Vector3(x + (name === 'A' ? -29 : 29), 25, 39), new THREE.Vector3(x, 9, 0))
  }
  camera.position.set(75, 55, 90)
  controls.target.copy(defaultTarget)
  controls.update()
  const resize = new ResizeObserver(() => {
    if (disposed) return
    const { width, height } = host.getBoundingClientRect()
    if (width < 1 || height < 1) return
    renderer.setSize(width, height)
    presentation.resize(width, height)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    if (!interactive) view(currentView)
    needsRender = true
  })
  resize.observe(host)
  const cancelFlight = () => {
    animation = null
    probe?.cancel('Kamera elle değişti; ölçümü yeniden başlatın.')
  }
  controls.addEventListener('start', cancelFlight)

  function highlight() {
    if (!state) return
    needsRender = true
    for (const mesh of selectionMeshes) {
      const id = mesh.userData.unitId as string
      const unit = inventoryById.get(id)!
      const eligible = state.visibleIds.has(id)
      const selected = state.selected?.id === id
      mesh.material.color.set(selected ? '#19b5bf' : hovered === id ? '#8ddddd' : statusColors[unit.status])
      mesh.material.emissive.set(selected ? '#09686b' : '#000000')
      mesh.material.emissiveIntensity = selected ? 0.7 : 0
      mesh.material.opacity = eligible
        ? selected
          ? 0.78
          : hovered === id
            ? 0.38
            : state.showStatus
              ? 0.18
              : 0
        : 0
      mesh.material.depthWrite = false
      mesh.visible = mesh.material.opacity > 0
      // Keep depth testing: far-side apartments must not glow through the building.
      mesh.renderOrder = 2
    }
    selectionOutline.visible = !!state.selected && state.visibleIds.has(state.selected.id)
    selectionFace.visible = selectionOutline.visible
    if (state.selected) {
      const volume = unitVolume(state.selected)
      const frontBack = state.selected.aspect === 'Güney' || state.selected.aspect === 'Kuzey'
      const width = frontBack ? 20.6 : 6.6
      const depth = frontBack ? 10.65 : 11.65
      const blockX = state.selected.block === 'A' ? -18 : 18
      selectionOutline.position.set(
        blockX + Math.sin(volume.angle) * depth,
        volume.center[1],
        Math.cos(volume.angle) * depth,
      )
      selectionOutline.rotation.y = volume.angle
      selectionOutline.scale.set(width, volume.size[1], 0.015)
      selectionFace.position.copy(selectionOutline.position)
      selectionFace.rotation.copy(selectionOutline.rotation)
      selectionFace.scale.set(width, volume.size[1], 1)
    }
  }
  function update(next: SceneState) {
    const changedLight = state?.evening !== next.evening
    const changedQuality = state?.detailed !== next.detailed
    if (
      !state ||
      Object.keys(next.filters).some(
        (key) => state!.filters[key as keyof UnitFilters] !== next.filters[key as keyof UnitFilters],
      )
    )
      renderer.shadowMap.needsUpdate = true
    state = next
    needsRender = true
    if (changedQuality) presentation.setQuality(next.detailed)
    const active = !!(next.filters.block || next.filters.floor || next.filters.room || next.filters.status)
    model?.traverse((object) => {
      if (object.userData.role === 'building')
        object.visible = !next.filters.block || object.userData.block === next.filters.block
      if (object.userData.role === 'floor')
        object.visible = !next.filters.floor || object.userData.floor <= Number(next.filters.floor)
      if (object.userData.role === 'roof') object.visible = !next.filters.floor
      if (object.userData.role === 'facade') {
        const muted = active && !next.visibleIds.has(object.userData.unitId)
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const m = child.material as THREE.MeshStandardMaterial
            const transparent = muted || m.userData.baseOpacity < 1
            if (m.transparent !== transparent) {
              m.transparent = transparent
              m.needsUpdate = true
            }
            m.opacity = muted ? 0.12 : m.userData.baseOpacity
            m.depthWrite = !muted && m.opacity === 1
            child.castShadow = !muted && m.opacity === 1
            child.layers.set(m.transparent ? 1 : 0)
          }
        })
      }
    })
    if (hovered && !next.visibleIds.has(hovered)) {
      hovered = null
      onHover(null)
    }
    controls.autoRotate = next.rotating && !reducedMotion
    if (changedLight) scene.environment = next.evening ? presentation.dusk.texture : presentation.day.texture
    highlight()
  }
  function focus(unit: Unit) {
    const v = unitVolume(unit)
    const target = new THREE.Vector3(...v.center)
    const direction = new THREE.Vector3(Math.sin(v.angle), 0.6, Math.cos(v.angle)).normalize()
    const facesCourtyard =
      (unit.block === 'A' && unit.aspect === 'Doğu') || (unit.block === 'B' && unit.aspect === 'Batı')
    if (facesCourtyard) {
      // Stay in the courtyard: a long focus orbit would place the camera in the opposite block.
      target.x = (unit.block === 'A' ? -18 : 18) + Math.sin(v.angle) * 11.65
      controls.minDistance = 8
      move(target.clone().addScaledVector(direction, 12.5), target)
    } else {
      controls.minDistance = 22
      move(
        target.clone().addScaledVector(direction, Math.max(37, 34 / Math.max(camera.aspect, 0.65))),
        target,
      )
    }
  }
  const raycaster = new THREE.Raycaster()
  function pick(event: PointerEvent) {
    if (!state || !model) return null
    const rect = renderer.domElement.getBoundingClientRect()
    raycaster.setFromCamera(
      new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    )
    return pickUnit(raycaster, selectionMeshes, state.visibleIds)
  }
  let down: { x: number; y: number; id: number } | null = null
  const pointerDown = (e: PointerEvent) => {
    if (!interactive) return
    if (e.isPrimary && e.button === 0) down = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }
  const pointerUp = (e: PointerEvent) => {
    if (down && down.id === e.pointerId && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
      const id = pick(e)
      if (id) onSelect(id)
    }
    down = null
  }
  const pointerMove = (e: PointerEvent) => {
    if (!interactive) return
    if (e.buttons) return
    if (e.timeStamp - lastHover < 32) return
    lastHover = e.timeStamp
    const id = pick(e)
    if (id !== hovered) {
      hovered = id
      onHover(id)
      highlight()
    }
    renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
  }
  let lastHover = 0
  const pointerLeave = () => {
    down = null
    hovered = null
    onHover(null)
    highlight()
  }
  const contextLost = (e: Event) => {
    e.preventDefault()
    onLost()
  }
  const canvas = renderer.domElement
  canvas.addEventListener('pointerdown', pointerDown)
  canvas.addEventListener('pointerup', pointerUp)
  canvas.addEventListener('pointermove', pointerMove)
  canvas.addEventListener('pointerleave', pointerLeave)
  canvas.addEventListener('pointercancel', pointerLeave)
  canvas.addEventListener('webglcontextlost', contextLost)
  let previous = performance.now()
  const dayBackground = new THREE.Color('#e9eeec'),
    duskBackground = new THREE.Color('#344555')
  const daySun = new THREE.Color('#fff3dc'),
    duskSun = new THREE.Color('#ffd09b')
  function updateLight(delta: number, snap = false) {
    const target = state?.evening ? 1 : 0
    const changed = Math.abs(target - lightMix) > 0.001
    lightMix = snap || reducedMotion || !changed ? target : THREE.MathUtils.damp(lightMix, target, 4, delta)
    if (changed) {
      renderer.shadowMap.needsUpdate = true
      ;(scene.background as THREE.Color).copy(dayBackground).lerp(duskBackground, lightMix)
      scene.fog!.color.copy(scene.background as THREE.Color)
      sun.color.copy(daySun).lerp(duskSun, lightMix)
      sun.intensity = THREE.MathUtils.lerp(2.5, 1.8, lightMix)
      sun.position.y = THREE.MathUtils.lerp(55, 12, lightMix)
      fill.intensity = THREE.MathUtils.lerp(1.1, 0.65, lightMix)
      scene.environmentIntensity = THREE.MathUtils.lerp(0.35, 0.28, lightMix)
      lightingMaterials.forEach((m) => {
        m.emissiveIntensity = THREE.MathUtils.lerp(0.15, 3.5, lightMix)
      })
    }
    return changed
  }
  renderer.setAnimationLoop((now) => {
    if (disposed || !active || document.hidden) return
    const delta = Math.min((now - previous) / 1000, 0.05)
    previous = now
    const wasAnimating = !!animation
    if (animation) {
      const t = Math.min((now - animation.start) / Math.max(1, options.transitionMs ?? 900), 1)
      const ease = t * t * (3 - 2 * t)
      camera.position.lerpVectors(animation.from, animation.to, ease)
      controls.target.lerpVectors(animation.targetFrom, animation.targetTo, ease)
      if (t === 1) animation = null
    }
    const cameraChanged = controls.update(delta)
    const lightChanged = updateLight(delta)
    if (needsRender || cameraChanged || wasAnimating || lightChanged) {
      const measuring = probe && now >= probe.start
      const cpuStart = measuring ? performance.now() : 0
      if (measuring) {
        renderer.info.autoReset = false
        renderer.info.reset()
      }
      presentation.render(delta)
      needsRender = false
      if (measuring) {
        probe!.frames.push({
          time: now,
          cpu: performance.now() - cpuStart,
          calls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
        })
        renderer.info.autoReset = true
      }
      if (firstFrame && model) {
        recordTiming('sceneToFirstFrame', sceneStarted)
        firstFrame = false
      }
    }
  })

  return {
    setModel(root: THREE.Group, units: Unit[]) {
      model = root
      units.forEach((unit) => inventoryById.set(unit.id, unit))
      const originalMaterials = new Set<THREE.Material>()
      const clonedMaterials = new Map<THREE.Material, THREE.Material>()
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        const original = object.material as THREE.MeshStandardMaterial
        originalMaterials.add(original)
        // Facades change independently when filtering; non-facade materials share clones.
        const dynamic = object.userData.role === 'selection' || object.parent?.userData.role === 'facade'
        let material = dynamic ? original.clone() : clonedMaterials.get(original)
        if (!material) {
          material = original.clone()
          clonedMaterials.set(original, material)
        }
        material.userData.baseOpacity = original.opacity
        object.material = material
        const surface = material as THREE.MeshStandardMaterial
        if (original.name === 'Architectural_light') lightingMaterials.add(surface)
        if (original.name === 'Limestone') stoneMaterials.add(surface)
        if (original.transparent) object.layers.set(1)
        object.castShadow = original.opacity === 1
        object.receiveShadow = true
        if (object.userData.role === 'selection') {
          object.castShadow = false
          object.receiveShadow = false
          // Enlarge just past the facade so highlighting isn't buried in glazing.
          object.scale.x += 0.18
          object.scale.z += 0.18
          object.layers.set(1)
          selectionMeshes.push(object as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>)
        }
      })
      originalMaterials.forEach((m) => m.dispose())
      if (
        selectionMeshes.length !== units.length ||
        units.some((u) => !selectionMeshes.some((m) => m.name === u.modelNodeId))
      )
        throw new Error('Model ve daire kimlikleri eşleşmiyor.')
      scene.add(root)
      renderer.shadowMap.needsUpdate = true
      // Non-critical texture: a failed texture must not prevent unit selection.
      new THREE.TextureLoader().load(
        publicAsset('/materials/limestone-albedo.webp'),
        (texture) => {
          if (disposed) {
            texture.dispose()
            return
          }
          stone = texture
          texture.colorSpace = THREE.SRGBColorSpace
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping
          texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
          stoneMaterials.forEach((m) => {
            m.map = texture
            m.color.set('#d9ccb4')
            m.bumpMap = texture
            m.bumpScale = 0.035
            m.needsUpdate = true
          })
          needsRender = true
        },
        undefined,
        () => {
          if (!disposed) onMaterialWarning()
        },
      )
      if (state) update(state)
      overview()
    },
    update,
    focus,
    overview,
    view,
    benchmark(mode: 'orbit' | 'idle'): Promise<unknown> {
      if (!diagnosticsEnabled || disposed || !model || !active || document.hidden)
        return Promise.reject(new Error('Ölçüm için görünür, hazır 3B sahne gerekli.'))
      if (probe) return Promise.reject(new Error('Bir ölçüm zaten sürüyor.'))
      return new Promise((resolve, reject) => {
        const position = camera.position.clone(),
          target = controls.target.clone(),
          rotate = controls.autoRotate
        const quality = state?.detailed,
          evening = state?.evening
        const initialState = JSON.stringify({
          selected: state?.selected?.id,
          filters: state?.filters,
          width: innerWidth,
          height: innerHeight,
        })
        animation = null
        controls.autoRotate = mode === 'orbit'
        needsRender = true
        const frames: Array<{ time: number; cpu: number; calls: number; triangles: number }> = []
        const start = performance.now() + 2000
        let longTasks = 0,
          longTaskMs = 0
        const observer = PerformanceObserver.supportedEntryTypes.includes('longtask')
          ? new PerformanceObserver((list) => {
              for (const entry of list.getEntries())
                if (entry.startTime >= start) {
                  longTasks++
                  longTaskMs += entry.duration
                }
            })
          : null
        observer?.observe({ type: 'longtask' })
        const finish = (error?: string) => {
          clearTimeout(timer)
          observer?.disconnect()
          document.removeEventListener('visibilitychange', visibility)
          const gl = renderer.getContext(),
            extension = gl.getExtension('WEBGL_debug_renderer_info')
          const result = {
            ...summarizeFrames(frames, performance.now() - start, mode),
            quality: quality ? 'detailed' : 'balanced',
            evening,
            viewport: [innerWidth, innerHeight],
            canvas: [canvas.width, canvas.height],
            dpr: renderer.getPixelRatio(),
            gpu: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unavailable',
            hardwareConcurrency: navigator.hardwareConcurrency,
            userAgent: navigator.userAgent,
            longTasks: observer ? longTasks : null,
            longTaskMs: observer ? Math.round(longTaskMs) : null,
            geometries: renderer.info.memory.geometries,
            textures: renderer.info.memory.textures,
            date: new Date().toISOString(),
            note: 'CPU render submission time is not GPU duration; viewport resize is not physical phone testing.',
          }
          probe = null
          controls.autoRotate = rotate
          camera.position.copy(position)
          controls.target.copy(target)
          controls.update()
          needsRender = true
          if (error) reject(new Error(error))
          else resolve(result)
        }
        const visibility = () => {
          if (document.hidden) finish('Sekme arka plana geçti; ölçüm geçersiz, yeniden deneyin.')
        }
        const timer = window.setTimeout(
          () =>
            finish(
              state?.detailed !== quality ||
                state?.evening !== evening ||
                initialState !==
                  JSON.stringify({
                    selected: state?.selected?.id,
                    filters: state?.filters,
                    width: innerWidth,
                    height: innerHeight,
                  })
                ? 'Sahne veya ekran değişti; ölçümü yeniden başlatın.'
                : undefined,
            ),
          10000,
        )
        document.addEventListener('visibilitychange', visibility)
        probe = { start, frames, cancel: finish }
      })
    },
    async capture(mode: 'unit' | 'presentation' = 'unit'): Promise<ViewSnapshot> {
      if (disposed || !model || !state || (mode === 'unit' && !state.selected))
        throw new Error('Önce modelden bir daire seçin.')
      // Complete an in-flight selection transition before recording the selected apartment.
      if (animation) {
        camera.position.copy(animation.to)
        controls.target.copy(animation.targetTo)
        animation = null
      }
      const size = renderer.getSize(new THREE.Vector2())
      const position = camera.position.clone(),
        target = controls.target.clone()
      const ratio = renderer.getPixelRatio(),
        aspect = camera.aspect,
        rotating = controls.autoRotate
      try {
        controls.autoRotate = false
        controls.update()
        renderer.setPixelRatio(1)
        renderer.setSize(1500, 950, false)
        presentation.resize(1500, 950)
        camera.aspect = 1500 / 950
        if (mode === 'presentation') {
          const pose = presentationCamera(currentView, camera.aspect)
          camera.position.set(...pose.position)
          controls.target.set(...pose.target)
          controls.update()
        }
        camera.updateProjectionMatrix()
        updateLight(0, true)
        presentation.render(0)
        // Read in the same task as the render; no permanently preserved WebGL buffer.
        return {
          dataUrl: canvas.toDataURL('image/png'),
          width: 1500,
          height: 950,
          capturedAt: new Date().toISOString(),
        }
      } finally {
        renderer.setPixelRatio(ratio)
        renderer.setSize(size.x, size.y, false)
        presentation.resize(size.x, size.y)
        camera.aspect = aspect
        if (mode === 'presentation') {
          camera.position.copy(position)
          controls.target.copy(target)
          controls.update()
        }
        camera.updateProjectionMatrix()
        controls.autoRotate = rotating
        needsRender = true
      }
    },
    setActive(value: boolean) {
      if (!value) probe?.cancel('Sahne duraklatıldı; ölçüm iptal edildi.')
      active = value
      controls.enabled = value && interactive
      needsRender = true
    },
    top() {
      move(new THREE.Vector3(0, 105, 0.1), new THREE.Vector3(0, 0, 0))
    },
    dispose() {
      probe?.cancel('3B sahne kapatıldı; ölçüm iptal edildi.')
      disposed = true
      renderer.setAnimationLoop(null)
      resize.disconnect()
      unbindInvalidation()
      controls.removeEventListener('start', cancelFlight)
      controls.dispose()
      canvas.removeEventListener('pointerdown', pointerDown)
      canvas.removeEventListener('pointerup', pointerUp)
      canvas.removeEventListener('pointermove', pointerMove)
      canvas.removeEventListener('pointerleave', pointerLeave)
      canvas.removeEventListener('pointercancel', pointerLeave)
      canvas.removeEventListener('webglcontextlost', contextLost)
      disposeModel(scene)
      stone?.dispose()
      presentation.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
      selectionMeshes = []
    },
  }
}
