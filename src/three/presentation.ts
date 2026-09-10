import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

/** Selection/transparent meshes use layer 1, so they don't become AO occluders. */
class SurfaceAO extends GTAOPass {
  override render(...args: Parameters<GTAOPass['render']>) {
    const mask = this.camera.layers.mask
    this.camera.layers.disable(1)
    try {
      super.render(...args)
    } finally {
      this.camera.layers.mask = mask
    }
  }
}

export function createPresentation(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
) {
  const pmrem = new THREE.PMREMGenerator(renderer)
  const sky = new Sky()
  sky.scale.setScalar(60)
  const skyScene = new THREE.Scene()
  skyScene.add(sky)
  const uniforms = sky.material.uniforms
  uniforms.turbidity.value = 3
  uniforms.rayleigh.value = 1.8
  uniforms.mieCoefficient.value = 0.005
  uniforms.mieDirectionalG.value = 0.8
  if (uniforms.showSunDisc) uniforms.showSunDisc.value = false
  uniforms.sunPosition.value.set(-40, 55, 35).normalize()
  const day = pmrem.fromScene(skyScene, 0.03)
  uniforms.sunPosition.value.set(-40, 8, 35).normalize()
  const dusk = pmrem.fromScene(skyScene, 0.03)
  sky.geometry.dispose()
  sky.material.dispose()
  pmrem.dispose()

  // Allocate the heavier AO pipeline only when explicitly enabled.
  let composer: EffectComposer | null = null
  let ao: SurfaceAO | null = null
  let renderPass: RenderPass | null = null
  let output: OutputPass | null = null
  let width = 1,
    height = 1
  function setQuality(detailed: boolean) {
    if (detailed && !composer) {
      const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 4 })
      composer = new EffectComposer(renderer, target)
      composer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.25))
      renderPass = new RenderPass(scene, camera)
      ao = new SurfaceAO(scene, camera, width, height)
      ao.blendIntensity = 0.65
      ao.updateGtaoMaterial({ radius: 1.2, distanceExponent: 1, thickness: 0.5, scale: 1 })
      output = new OutputPass()
      composer.addPass(renderPass)
      composer.addPass(ao)
      composer.addPass(output)
      composer.setSize(width, height)
    } else if (!detailed && composer) {
      ao?.dispose()
      output?.dispose()
      renderPass?.dispose()
      composer.dispose()
      composer = null
      ao = null
      output = null
      renderPass = null
    }
  }
  return {
    day,
    dusk,
    setQuality,
    resize(w: number, h: number) {
      width = w
      height = h
      composer?.setSize(w, h)
    },
    render(delta: number) {
      if (composer) composer.render(delta)
      else renderer.render(scene, camera)
    },
    dispose() {
      setQuality(false)
      day.dispose()
      dusk.dispose()
    },
  }
}
