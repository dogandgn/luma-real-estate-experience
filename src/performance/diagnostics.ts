export const diagnosticsEnabled =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('diagnostics') === '1'
const timings: Record<string, number> = {}
export function recordTiming(name: string, start: number) {
  if (diagnosticsEnabled) timings[name] = Math.round((performance.now() - start) * 10) / 10
}
export function diagnosticTimings() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
  return {
    ...timings,
    documentLoad: navigation?.loadEventEnd,
    firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    mapReadySinceNavigation: performance.getEntriesByName('luma-map-ready').at(-1)?.startTime,
    assets: performance
      .getEntriesByType('resource')
      .filter((e) => /\.glb|\.ttf|BuildingViewer|PortfolioMap/.test(e.name))
      .map((e) => {
        const r = e as PerformanceResourceTiming
        return {
          name: new URL(r.name).pathname,
          durationMs: Math.round(r.duration),
          transferredBytes: r.transferSize,
          decodedBytes: r.decodedBodySize,
        }
      }),
  }
}
export function percentile(values: number[], fraction: number) {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.max(0, Math.ceil(fraction * sorted.length) - 1)]
}
export function summarizeFrames(
  frames: Array<{ time: number; cpu: number; calls: number; triangles: number }>,
  duration: number,
  mode: 'orbit' | 'idle',
) {
  const intervals = frames.slice(1).map((frame, i) => frame.time - frames[i].time)
  const round = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100)
  return {
    mode,
    measuredMs: round(duration),
    renderedFrames: frames.length,
    fps:
      mode === 'idle' || !intervals.length
        ? null
        : round((1000 * intervals.length) / intervals.reduce((a, b) => a + b, 0)),
    frameP95Ms: round(percentile(intervals, 0.95)),
    over33msPercent: intervals.length
      ? round((intervals.filter((n) => n > 33.34).length / intervals.length) * 100)
      : null,
    over50ms: intervals.filter((n) => n > 50).length,
    cpuRenderP95Ms: round(
      percentile(
        frames.map((f) => f.cpu),
        0.95,
      ),
    ),
    maxDrawCalls: Math.max(0, ...frames.map((f) => f.calls)),
    maxTriangles: Math.max(0, ...frames.map((f) => f.triangles)),
  }
}
