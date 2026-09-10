import { useEffect, useRef, useState } from 'react'
import { Check, Download, FileText, LoaderCircle, RefreshCw, X } from 'lucide-react'
import {
  defaultReportOptions,
  reportFilename,
  type ReportContext,
  type ReportOptions,
} from '../domain/report'
import './report.css'

export function ReportDialog({
  capture,
  onClose,
}: {
  capture: () => Promise<ReportContext>
  onClose: () => void
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const captureFn = useRef(capture)
  const objectUrl = useRef<string | null>(null)
  const [context, setContext] = useState<ReportContext | null>(null)
  const [options, setOptions] = useState<ReportOptions>(defaultReportOptions)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [capturing, setCapturing] = useState(true)
  const [retry, setRetry] = useState(0)
  const [download, setDownload] = useState<{ url: string; name: string } | null>(null)
  captureFn.current = capture
  const clearDownload = () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = null
    setDownload(null)
  }
  useEffect(() => {
    const el = dialog.current
    el?.showModal()
    return () => {
      el?.close()
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    }
  }, [])
  useEffect(() => {
    let gone = false
    setCapturing(true)
    setError('')
    setContext(null)
    clearDownload()
    captureFn
      .current()
      .then((result) => {
        if (!gone) setContext(result)
      })
      .catch((err) => {
        if (!gone) setError(err instanceof Error ? err.message : 'Görseller alınamadı.')
      })
      .finally(() => {
        if (!gone) setCapturing(false)
      })
    return () => {
      gone = true
    }
  }, [retry])
  const update = <K extends keyof ReportOptions>(key: K, value: ReportOptions[K]) => {
    setOptions((o) => ({ ...o, [key]: value }))
    clearDownload()
  }
  const generate = async () => {
    if (!context || busy) return
    setBusy(true)
    setError('')
    clearDownload()
    try {
      const { createReportPdf } = await import('../report/create-pdf')
      const bytes = await createReportPdf(context, options)
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
      const url = URL.createObjectURL(
        new Blob([bytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' }),
      )
      objectUrl.current = url
      const name = reportFilename(context, options.purpose)
      setDownload({ url, name })
      const link = document.createElement('a')
      link.href = url
      link.download = name
      link.click()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF oluşturulamadı. Yeniden deneyin.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <dialog
      ref={dialog}
      className="report-dialog"
      aria-labelledby="report-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose()
      }}
      onCancel={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!busy) onClose()
      }}
    >
      <header className="report-header">
        <div>
          <span className="eyebrow">LUMA / MÜŞTERİ DOSYASI</span>
          <h2 id="report-title">PDF bilgi föyü</h2>
        </div>
        <button
          className="icon-button"
          autoFocus
          disabled={busy}
          aria-label="PDF penceresini kapat"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </header>
      <div className="report-workspace">
        <section className="report-form" aria-label="PDF belge bilgileri">
          <label>
            Belge türü
            <select
              value={options.purpose}
              disabled={busy}
              onChange={(e) => update('purpose', e.target.value as ReportOptions['purpose'])}
            >
              <option value="information">Müşteri bilgi föyü</option>
              <option value="annex">Sözleşme eki taslağı</option>
            </select>
          </label>
          <label>
            Müşteri / alıcı <span>İsteğe bağlı</span>
            <input
              maxLength={80}
              value={options.customer}
              disabled={busy}
              onChange={(e) => update('customer', e.target.value)}
              placeholder="Ad soyad veya kurum"
            />
          </label>
          <label>
            Hazırlayan danışman
            <input
              maxLength={80}
              value={options.advisor}
              disabled={busy}
              onChange={(e) => update('advisor', e.target.value)}
              placeholder="Danışman / ofis"
            />
          </label>
          <div className="report-field-row">
            <label>
              Dosya / sözleşme referansı
              <input
                maxLength={60}
                value={options.reference}
                disabled={busy}
                onChange={(e) => update('reference', e.target.value)}
                placeholder="Referans numarası"
              />
            </label>
            <label>
              Ek no.
              <input
                maxLength={12}
                value={options.appendix}
                disabled={busy}
                onChange={(e) => update('appendix', e.target.value)}
                placeholder="01"
              />
            </label>
          </div>
          <label>
            Belge notu
            <textarea
              maxLength={300}
              rows={4}
              value={options.notes}
              disabled={busy}
              onChange={(e) => update('notes', e.target.value)}
              placeholder="Müşteriye iletilecek ek açıklamalar"
            />
            <small>{options.notes.length} / 300</small>
          </label>
          <div className="report-warning">
            <strong>Demo / doğrulama gerekli</strong>
            <p>
              Proje, fiyat ve konum temsilidir. Çıktı onaylı mimari plan, tapu belgesi veya imzalanmış
              sözleşme değildir. Gerçek sözleşmeye eklenmeden önce bilgiler ve belge kapsamı yetkili kişilerce
              doğrulanmalıdır.
            </p>
          </div>
          <p className="report-privacy">
            PDF cihazınızda hazırlanır. Girdiğiniz müşteri bilgileri kaydedilmez veya bir sunucuya
            gönderilmez.
          </p>
        </section>
        <section className="report-preview" aria-label="PDF görsel ve kapsam önizlemesi">
          {capturing && (
            <div className="report-loading" role="status">
              <LoaderCircle className="spin" />
              <strong>Seçili daire ve konum görüntüsü alınıyor…</strong>
            </div>
          )}
          {context && (
            <>
              <div className="report-preview-title">
                <span>
                  {context.project.name} / {context.unit.number}
                </span>
                <b>3 BÖLÜM · A4</b>
              </div>
              <figure>
                <img
                  src={context.model.dataUrl}
                  alt={`${context.unit.number} seçili dairesinin PDF için alınan 3B görüntüsü`}
                />
                <figcaption>01 / Daire özeti ve 3B görünüm</figcaption>
              </figure>
              <figure className="report-map-preview">
                <img src={context.map.dataUrl} alt="PDF için alınan temsili proje konumu haritası" />
                <figcaption>02 / Bölgesel konum ve donatı mesafeleri</figcaption>
              </figure>
              <div className="report-scope">
                <FileText size={18} />
                <span>03 / Ölçeksiz plan şeması ve belge referansları</span>
              </div>
              <p className="report-data-note">
                {context.nearbyMode === 'sample'
                  ? `${context.nearby.length} temsili donatı kaydı dahil. Noktalar ve mesafeler gerçek değildir.`
                  : 'Donatı verisi henüz bağlı değil. Mesafe tablosunda “Veri bağlı değil” yazacak; mesafe uydurulmayacak.'}
              </p>
            </>
          )}
          {error && (
            <div className="report-error" role="alert">
              <strong>İşlem tamamlanamadı</strong>
              <p>{error}</p>
              {!context && (
                <button onClick={() => setRetry((v) => v + 1)}>
                  <RefreshCw size={15} /> Yeniden dene
                </button>
              )}
            </div>
          )}
        </section>
      </div>
      <footer className="report-footer">
        <div>
          {download ? (
            <span className="report-success" role="status">
              <Check size={16} /> PDF hazır.{' '}
              <a href={download.url} download={download.name}>
                Tekrar indir
              </a>
            </span>
          ) : (
            <span>Görseller açılış anında alınır. Farklı açı için kapatıp modeli ayarlayın.</span>
          )}
        </div>
        <button className="primary" disabled={!context || busy || capturing} onClick={() => void generate()}>
          {busy ? <LoaderCircle size={17} className="spin" /> : <Download size={17} />}{' '}
          {busy ? 'PDF hazırlanıyor…' : 'PDF oluştur ve indir'}
        </button>
      </footer>
    </dialog>
  )
}
