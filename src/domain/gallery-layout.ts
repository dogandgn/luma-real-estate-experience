export function galleryIndex(progress: number, count: number) {
  return Math.round(
    Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0)) * Math.max(0, count - 1),
  )
}

export function galleryModeScrollAdjustment(
  top: number,
  oldHeight: number,
  newHeight: number,
  newRange: number,
  progress: number,
) {
  if (top + oldHeight <= 0) return newHeight - oldHeight
  if (top <= 0) return top + Math.max(0, newRange) * Math.max(0, Math.min(1, progress))
  return 0
}
