import { describe, expect, it, vi } from 'vitest'
import { PerspectiveCamera } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { bindControlInvalidation } from './invalidation'

class ControlSurface extends EventTarget {
  ownerDocument = new EventTarget()
  style = { touchAction: '', cursor: '' }
  clientWidth = 800
  clientHeight = 600
  getRootNode() {
    return this.ownerDocument
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 800, height: 600 }
  }
}

describe('On-demand 3D wheel rendering', () => {
  it('invalidates for every real OrbitControls wheel update, including before the next frame', () => {
    const surface = new ControlSurface()
    const camera = new PerspectiveCamera(45, 4 / 3, 0.1, 1000)
    camera.position.set(0, 0, 50)
    const controls = new OrbitControls(camera, surface as unknown as HTMLElement)
    controls.enableDamping = true
    controls.zoomSpeed = 0.65
    const invalidate = vi.fn()
    const unbind = bindControlInvalidation(controls, invalidate)
    const wheel = (deltaY: number) => {
      const event = new Event('wheel', { cancelable: true })
      Object.assign(event, { deltaY, deltaMode: 0, clientX: 400, clientY: 300, ctrlKey: false })
      surface.dispatchEvent(event)
    }
    for (const delta of [-120, -120, 120, -20, 20]) {
      invalidate.mockClear()
      const before = camera.position.length()
      wheel(delta)
      expect(invalidate).toHaveBeenCalled()
      expect(delta < 0 ? camera.position.length() < before : camera.position.length() > before).toBe(true)
      // The event already updated controls: polling update alone would skip rendering.
      expect(controls.update()).toBe(false)
    }
    unbind()
    invalidate.mockClear()
    wheel(120)
    expect(invalidate).not.toHaveBeenCalled()
    controls.dispose()
  })
})
