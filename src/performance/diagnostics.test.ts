import { expect, it } from 'vitest'
import { percentile, summarizeFrames } from './diagnostics'
it('calculates measured frame intervals and percentiles without inventing idle FPS', () => {
  expect(percentile([], 0.95)).toBeNull()
  expect(percentile([4, 1, 3, 2], 0.95)).toBe(4)
  const frames = [0, 20, 40, 100].map((time) => ({ time, cpu: 2, calls: 12, triangles: 100 }))
  expect(summarizeFrames(frames, 100, 'orbit')).toMatchObject({
    fps: 30,
    frameP95Ms: 60,
    over50ms: 1,
    maxDrawCalls: 12,
  })
  expect(summarizeFrames([], 8000, 'idle')).toMatchObject({
    fps: null,
    renderedFrames: 0,
    cpuRenderP95Ms: null,
  })
})
