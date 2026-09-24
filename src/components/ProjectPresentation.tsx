import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ArrowDown, ArrowLeft, ArrowUpRight, Box, MapPin } from 'lucide-react'
import { config } from '../config'
import type { Project } from '../domain/types'
import type { PresentationContent } from '../domain/project-presentation'
import './project-presentation.css'
import { PresentationGallery } from './PresentationGallery'

const PresentationModel = lazy(() =>
  import('./PresentationModel').then((module) => ({ default: module.PresentationModel })),
)

class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? (
      <div className="presentation-model-placeholder" role="status">
        Mimari görüntüleyici yüklenemedi. Sunum kullanılabilir; yeniden yüklemek için sayfayı yenileyin.
      </div>
    ) : (
      this.props.children
    )
  }
}

const chapters = [
  ['opening', 'Başlangıç'],
  ['architecture', 'Mimari'],
  ['life', 'Avluda yaşam'],
  ['location', 'Konum'],
  ['residences', 'Daireler'],
] as const

interface Props {
  project: Project
  content: PresentationContent
  onClose: () => void
  onLocation: () => void
  onSelectUnit: () => void
  active?: boolean
}

export function ProjectPresentation({
  project,
  content,
  onClose,
  onLocation,
  onSelectUnit,
  active = true,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [chapter, setChapter] = useState<string>('opening')
  const [modelEnabled, setModelEnabled] = useState(false)
  const modelHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (modelEnabled) modelHeading.current?.focus({ preventScroll: true })
  }, [modelEnabled])

  useLayoutEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    element?.showModal()
    return () => {
      element?.close()
      const fallback = Array.from(
        document.querySelectorAll<HTMLButtonElement>('[data-present-project]'),
      ).find((button) => button.dataset.presentProject === project.id)
      const target =
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        previousFocus !== document.body &&
        !element?.contains(previousFocus)
          ? previousFocus
          : fallback
      target?.focus({ preventScroll: true })
    }
  }, [project.id])

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'))
    let frame = 0
    const update = () => {
      frame = 0
      const line = root.scrollTop + root.clientHeight * 0.25
      const current = sections.filter((section) => section.offsetTop <= line).at(-1)
      const atBottom = root.scrollTop + root.clientHeight >= root.scrollHeight - 4
      setChapter(atBottom ? 'residences' : (current?.dataset.chapter ?? 'opening'))
      root.style.setProperty(
        '--hero-progress',
        String(Math.min(1, root.scrollTop / Math.max(1, root.clientHeight))),
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    root.addEventListener('scroll', schedule, { passive: true })
    const resize = new ResizeObserver(schedule)
    resize.observe(root)
    sections.forEach((section) => resize.observe(section))
    update()
    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('presentation-revealed')
          reveals.unobserve(entry.target)
        }
      },
      { root, threshold: 0.12 },
    )
    root
      .querySelectorAll(
        '.presentation-editorial, .presentation-architecture-image, .presentation-life > h2, .presentation-location > div, .presentation-residences > h2',
      )
      .forEach((element) => reveals.observe(element))
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('scroll', schedule)
      resize.disconnect()
      reveals.disconnect()
    }
  }, [])

  const navigate = (id: string) => {
    const root = scroller.current
    const section = root?.querySelector<HTMLElement>(`[data-chapter="${id}"]`)
    if (!root || !section) return
    root.scrollTo({
      top: section.offsetTop,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
    section.focus({ preventScroll: true })
  }

  return (
    <dialog
      ref={dialog}
      className="presentation-dialog"
      aria-labelledby="presentation-title"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
    >
      <header className="presentation-header">
        <button onClick={onClose} className="presentation-back">
          <ArrowLeft size={17} />
          <span>Portföye dön</span>
        </button>
        <span className="presentation-wordmark">
          luma<span> / avlu</span>
        </span>
        <button onClick={onSelectUnit} className="presentation-select">
          Daire seç <ArrowUpRight size={17} />
        </button>
      </header>
      <nav className="presentation-chapters" aria-label="Sunum bölümleri">
        {chapters.map(([id, label], index) => (
          <button key={id} aria-current={chapter === id ? 'step' : undefined} onClick={() => navigate(id)}>
            <span>0{index + 1}</span>
            {label}
          </button>
        ))}
      </nav>
      <div className="presentation-scroll" ref={scroller}>
        <section
          data-chapter="opening"
          tabIndex={-1}
          className="presentation-hero"
          aria-labelledby="presentation-title"
        >
          <img
            className="presentation-hero-image"
            src={content.hero ?? config.images[project.image]}
            srcSet={
              content.hero && content.heroMobile
                ? `${content.heroMobile} 768w, ${content.hero} 1672w`
                : undefined
            }
            sizes="100vw"
            decoding="async"
            alt="Luma Avlu için temsili, avlu ve havuz çevresinde konut konsepti"
            fetchPriority="high"
          />
          <div className="presentation-hero-copy">
            <p className="presentation-kicker">
              İZMİR / {project.district.toLocaleUpperCase('tr-TR')} · KONSEPT PROJE
            </p>
            <h1 id="presentation-title">{content.heading}</h1>
            <div className="presentation-hero-bottom">
              <p>{content.introduction}</p>
              <button className="presentation-round-link" onClick={() => navigate('architecture')}>
                Hikâyeyi keşfet{' '}
                <span>
                  <ArrowDown size={23} />
                </span>
              </button>
            </div>
          </div>
          <span className="presentation-image-note">
            Yapay zekâ ile üretilmiş temsili konsept · Mimari, çevre ve manzara temsildir
          </span>
        </section>

        <section
          data-chapter="architecture"
          tabIndex={-1}
          className="presentation-section presentation-architecture"
          aria-labelledby="architecture-title"
        >
          <div className="presentation-editorial">
            <p className="presentation-kicker">02 / MİMARİ YAKLAŞIM</p>
            <h2 id="architecture-title">
              Bir yapıdan
              <br />
              daha fazlası.
            </h2>
            <p className="presentation-body">{content.architecture}</p>
            <dl className="presentation-facts">
              <div>
                <dt>Konut</dt>
                <dd>{project.totalUnits}</dd>
              </div>
              <div>
                <dt>Daire tipleri</dt>
                <dd>{project.rooms.join(' / ')}</dd>
              </div>
              <div>
                <dt>Net alan</dt>
                <dd>
                  {project.areaRange.join('–')} <small>m²</small>
                </dd>
              </div>
            </dl>
          </div>
          <figure className="presentation-architecture-image">
            <img
              src={content.cinematic?.[2]?.image ?? content.media?.facade ?? config.images[project.image]}
              srcSet={
                content.cinematic?.[2]?.mobileImage
                  ? `${content.cinematic[2].mobileImage} 768w, ${content.cinematic[2].image} 1672w`
                  : undefined
              }
              sizes="(max-width: 600px) 100vw, 43vw"
              decoding="async"
              alt={
                content.cinematic
                  ? 'Model referanslı, yapay zekâ ile hazırlanmış temsili cephe yaklaşımı'
                  : content.media
                    ? 'Daire seçimindeki Luma Avlu modelinden A blok cephe görünümü'
                    : 'Temsili cephe ve peyzaj yaklaşımı'
              }
              loading="lazy"
              width={content.cinematic ? 1672 : content.media ? 1500 : 1280}
              height={content.cinematic ? 941 : content.media ? 950 : 853}
            />
            <figcaption>
              {content.cinematic
                ? 'Model referanslı yapay zekâ görselleştirmesi. Cephe ve peyzaj ayrıntıları temsildir; birebir model renderı değildir.'
                : content.media
                  ? 'Özgün seçim modelinden üretilen cephe görünümü. Temsili mimari taslak; uygulama projesi değildir.'
                  : 'Bir yaşam fikri. Uygulama projesi veya mevcut 3B modelin birebir renderı değildir.'}
            </figcaption>
          </figure>
          {project.modelUrl && (
            <div className="presentation-model-story">
              <div className="presentation-model-heading">
                <div>
                  <p className="presentation-kicker">AYNI PROJE, ÜÇ BAKIŞ</p>
                  <h3 ref={modelHeading} tabIndex={-1}>
                    Konseptten modele.
                  </h3>
                </div>
                <p>
                  Satış ekranındaki binayı, mimari açılarıyla keşfedin. Sayfa kaydırması modelin üzerinde de
                  devam eder.
                </p>
              </div>
              {modelEnabled ? (
                <ModelBoundary>
                  <Suspense
                    fallback={
                      <div className="presentation-model-placeholder" role="status">
                        Mimari görüntüleyici açılıyor…
                      </div>
                    }
                  >
                    <PresentationModel modelUrl={project.modelUrl} projectId={project.id} active={active} />
                  </Suspense>
                </ModelBoundary>
              ) : (
                <button
                  className={`presentation-model-placeholder ${content.media ? 'has-poster' : ''}`}
                  onClick={() => setModelEnabled(true)}
                >
                  {content.media && (
                    <img src={content.media.overview} alt="" loading="lazy" width="1500" height="950" />
                  )}
                  <span className="presentation-poster-copy">
                    <Box size={36} strokeWidth={1} />
                    <strong>Mimari modeli aç</strong>
                    <span>Genel görünüm · Avlu · Cephe</span>
                    <small>3B içerik yalnızca istediğinizde yüklenir.</small>
                  </span>
                </button>
              )}
            </div>
          )}
        </section>

        <section
          data-chapter="life"
          tabIndex={-1}
          className="presentation-section presentation-life"
          aria-labelledby="life-title"
        >
          <p className="presentation-kicker">03 / AVLUDA YAŞAM</p>
          <h2 id="life-title">
            Günün en güzel anı,
            <br />
            <em>eve dönmek.</em>
          </h2>
          <p className="presentation-body">{content.lifestyle}</p>
          {content.cinematic ? (
            <PresentationGallery slides={content.cinematic} scroller={scroller} />
          ) : (
            content.media && (
              <figure className="presentation-life-image">
                <img
                  src={content.media.courtyard}
                  alt="Aynı Luma Avlu modelinde ortak avlu, havuz ve peyzaj"
                  loading="lazy"
                  width="1500"
                  height="950"
                />
                <figcaption>Ortak avlu · Özgün 3B modelden temsili görünüm</figcaption>
              </figure>
            )
          )}
          <div className="presentation-amenities">
            {project.amenities.map((amenity, index) => (
              <div key={amenity}>
                <span>0{index + 1}</span>
                <h3>{amenity}</h3>
              </div>
            ))}
          </div>
          <p className="presentation-footnote">
            Demo proje özellikleridir; gerçek bir satış veya tesis taahhüdü değildir.
          </p>
        </section>

        <section
          data-chapter="location"
          tabIndex={-1}
          className="presentation-section presentation-location"
          aria-labelledby="location-title"
        >
          <div>
            <p className="presentation-kicker">04 / BÖLGEYİ KEŞFET</p>
            <h2 id="location-title">
              İzmir’e yakın.
              <br />
              Kendine ait.
            </h2>
            <p className="presentation-body">
              {project.district} çevresini gerçek altlık harita üzerinde inceleyin. Proje konumu bölgesel ve
              temsilidir; herhangi bir parseli veya mülkiyeti hedef almaz.
            </p>
            <button className="presentation-action" onClick={onLocation}>
              <MapPin size={18} /> Haritada konumu incele <ArrowUpRight size={18} />
            </button>
          </div>
          <div className="presentation-location-card">
            <MapPin size={34} strokeWidth={1} />
            <p>İZMİR</p>
            <h3>{project.district}</h3>
            <span>Harita + yakın çevre</span>
            <p className="presentation-body">
              Mevcut harita ve çevre paneline geçilir. Gerçek donatı verisi henüz bağlı değildir; örnek akış
              ayrıca işaretlenir.
            </p>
          </div>
        </section>

        <section
          data-chapter="residences"
          tabIndex={-1}
          className="presentation-section presentation-residences"
          aria-labelledby="residences-title"
        >
          <p className="presentation-kicker">05 / SİZİN YAŞAM ALANINIZ</p>
          <h2 id="residences-title">
            Şimdi, sizin
            <br />
            <em>bakış açınız.</em>
          </h2>
          <p className="presentation-body">
            Blok ve katları 3B modelde keşfedin. Dairenizi seçin; özelliklerini, plan şemasını ve PDF bilgi
            föyünü aynı dosyada inceleyin.
          </p>
          <button className="presentation-action" onClick={onSelectUnit}>
            <Box size={19} /> 3B daire seçimine geç <ArrowUpRight size={19} />
          </button>
          <span className="presentation-availability">
            {project.availableUnits} uygun daire / {project.totalUnits} konut · Demo envanteri
          </span>
          <footer className="presentation-footer">
            <span>luma / avlu</span>
            <p>
              Portföy amaçlı konsept sunumu. Gerçek satış ilanı değildir. Fotogerçekçi görseller model
              referanslı yapay zekâ yorumlarıdır; geometri, çevre ve manzara temsildir. Canlı 3B görünüm
              gerçek seçim modelini kullanır.
            </p>
            <button onClick={onClose}>
              Portföye dön <ArrowUpRight size={16} />
            </button>
          </footer>
        </section>
      </div>
    </dialog>
  )
}
