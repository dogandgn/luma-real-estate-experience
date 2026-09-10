import { useState } from 'react'
import { diagnosticTimings } from '../performance/diagnostics'
import './performance.css'

export function PerformancePanel({ measure }: { measure: (mode: 'orbit' | 'idle') => Promise<unknown> }) {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState('')
  const run = async (mode: 'orbit' | 'idle') => {
    setBusy(true)
    setResult('')
    try {
      setResult(JSON.stringify({ result: await measure(mode), timingsMs: diagnosticTimings() }, null, 2))
    } catch (error) {
      setResult(error instanceof Error ? error.message : 'Ölçüm tamamlanamadı.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <details className="performance-panel">
      <summary>Yerel performans ölçümü</summary>
      <p>
        2 sn ısınma + 8 sn ölçüm. Sekmeyi görünür tutun; kamera/kaliteyi değiştirmeyin. Sonuç bu cihaz
        içindir, telefon simülasyonu değildir.
      </p>
      <div>
        <button disabled={busy} onClick={() => void run('orbit')}>
          Dönüşü ölç
        </button>
        <button disabled={busy} onClick={() => void run('idle')}>
          Durağan sahneyi ölç
        </button>
      </div>
      {busy && <p role="status">10 saniyelik ölçüm sürüyor…</p>}
      {result && <pre aria-label="Performans sonucu">{result}</pre>}
    </details>
  )
}
