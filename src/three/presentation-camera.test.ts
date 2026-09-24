import { expect, it } from 'vitest'
import { presentationCamera } from './presentation-camera'

it('fits narrow presentation views while preserving the architectural target', () => {
  for (const view of ['overview', 'courtyard', 'A', 'B'] as const) {
    const wide = presentationCamera(view, 16 / 9)
    const narrow = presentationCamera(view, 0.8)
    const distance = (pose: typeof wide) => Math.hypot(...pose.position.map((v, i) => v - pose.target[i]))
    expect(narrow.target).toEqual(wide.target)
    expect(distance(narrow)).toBeGreaterThan(distance(wide))
    expect(presentationCamera(view, NaN).position.every(Number.isFinite)).toBe(true)
    expect(distance(presentationCamera(view, 0.001))).toBeLessThan(210)
  }
})

it('keeps courtyard outside the front facade and block views symmetric', () => {
  expect(presentationCamera('courtyard', 1.8).position[2]).toBeGreaterThan(40)
  const a = presentationCamera('A', 1.8),
    b = presentationCamera('B', 1.8)
  expect(a.position[0]).toBe(-b.position[0])
  expect(a.target[0]).toBe(-b.target[0])
  expect(a.position.slice(1)).toEqual(b.position.slice(1))
})
