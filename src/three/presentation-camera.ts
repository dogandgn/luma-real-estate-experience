type View = 'overview' | 'courtyard' | 'A' | 'B'
type Point = [number, number, number]

export function presentationCamera(view: View, aspect: number): { position: Point; target: Point } {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  const distance = Math.max(1, Math.min(1.65, 1.25 / safeAspect))
  const target: Point =
    view === 'overview' ? [0, 5, 0] : view === 'courtyard' ? [0, 7, -3] : [view === 'A' ? -18 : 18, 9, 0]
  const offset: Point =
    view === 'overview' ? [64, 38, 78] : view === 'courtyard' ? [3, 8, 66] : [view === 'A' ? -34 : 34, 17, 45]
  return { position: offset.map((value, index) => target[index] + value * distance) as Point, target }
}
