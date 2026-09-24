import { expect, it } from 'vitest'
import { galleryIndex, galleryModeScrollAdjustment } from './gallery-layout'

it('clamps indices at gallery boundaries and tolerates empty or single slide sets', () => {
  expect(galleryIndex(-1, 3)).toBe(0)
  expect(galleryIndex(0.5, 3)).toBe(1)
  expect(galleryIndex(2, 3)).toBe(2)
  expect(galleryIndex(NaN, 3)).toBe(0)
  expect(galleryIndex(1, 0)).toBe(0)
  expect(galleryIndex(1, 1)).toBe(0)
})

it('keeps the gallery top in view when leaving a pinned story', () => {
  expect(galleryModeScrollAdjustment(-600, 1800, 550, 0, 0.5)).toBe(-600)
})

it('restores the selected slide when returning to the pinned story', () => {
  expect(galleryModeScrollAdjustment(0, 550, 1800, 1200, 0.5)).toBe(600)
})

it('preserves downstream reading position as gallery height changes', () => {
  expect(galleryModeScrollAdjustment(-2000, 1800, 550, 0, 1)).toBe(-1250)
})

it('does not jump to a gallery that has not entered the viewport', () => {
  expect(galleryModeScrollAdjustment(500, 550, 1800, 1200, 0)).toBe(0)
})
