import { useEffect, useRef, useState, type RefObject } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import type { PresentationSlide } from '../domain/project-presentation'
import { galleryIndex, galleryModeScrollAdjustment } from '../domain/gallery-layout'

export function PresentationGallery({
  slides,
  scroller,
}: {
  slides: PresentationSlide[]
  scroller: RefObject<HTMLDivElement | null>
}) {
  const wrapper = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLDivElement>(null)
  const sticky = useRef<HTMLDivElement>(null)
  const pinned = useRef(false)
  const selected = useRef(0)
  const trackWidth = useRef(0)
  const [simple, setSimple] = useState(false)
  const [index, setIndex] = useState(0)

  const select = (next: number) => {
    selected.current = next
    setIndex(next)
  }

  useEffect(() => {
    const root = scroller.current
    const element = wrapper.current
    const track = rail.current
    if (!root || !element || !track) return
    const media = window.matchMedia(
      '(min-width: 901px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)',
    )
    let frame = 0
    const update = () => {
      frame = 0
      if (!pinned.current) {
        if (trackWidth.current !== track.clientWidth) {
          trackWidth.current = track.clientWidth
          track.scrollTo({ left: selected.current * track.clientWidth, behavior: 'instant' })
        }
        return
      }
      const top = element.getBoundingClientRect().top - root.getBoundingClientRect().top
      const range = element.offsetHeight - (sticky.current?.offsetHeight ?? 0)
      const progress = Math.max(0, Math.min(1, -top / Math.max(1, range)))
      track.style.setProperty('--gallery-shift', `${-progress * (slides.length - 1) * track.clientWidth}px`)
      select(galleryIndex(progress, slides.length))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const configure = () => {
      const previousScroll = root.scrollTop
      const top = element.getBoundingClientRect().top - root.getBoundingClientRect().top
      const oldHeight = element.offsetHeight
      const nextPinned = media.matches && !simple && slides.length > 1
      const changed = pinned.current !== nextPinned
      const progress = selected.current / Math.max(1, slides.length - 1)
      pinned.current = nextPinned
      element.classList.toggle('is-pinned', nextPinned)
      track.style.removeProperty('--gallery-shift')
      trackWidth.current = track.clientWidth
      track.scrollTo({ left: nextPinned ? 0 : selected.current * track.clientWidth, behavior: 'instant' })
      if (changed) {
        const range = nextPinned ? element.offsetHeight - (sticky.current?.offsetHeight ?? 0) : 0
        root.scrollTo({
          top:
            previousScroll +
            galleryModeScrollAdjustment(top, oldHeight, element.offsetHeight, range, progress),
          behavior: 'instant',
        })
      }
      schedule()
    }
    configure()
    root.addEventListener('scroll', schedule, { passive: true })
    media.addEventListener('change', configure)
    const resize = new ResizeObserver(schedule)
    resize.observe(root)
    resize.observe(element)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('scroll', schedule)
      media.removeEventListener('change', configure)
      resize.disconnect()
    }
  }, [scroller, slides.length, simple])

  const go = (next: number) => {
    const target = galleryIndex(next / Math.max(1, slides.length - 1), slides.length)
    const root = scroller.current
    const element = wrapper.current
    const track = rail.current
    if (!root || !element || !track) return
    const behavior =
      simple || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    if (pinned.current) {
      const start = root.scrollTop + element.getBoundingClientRect().top - root.getBoundingClientRect().top
      const range = element.offsetHeight - (sticky.current?.offsetHeight ?? 0)
      root.scrollTo({ top: start + (target * range) / Math.max(1, slides.length - 1), behavior })
    } else track.scrollTo({ left: target * track.clientWidth, behavior })
  }

  return (
    <div
      ref={wrapper}
      className="presentation-gallery"
      role="region"
      aria-roledescription="görsel galeri"
      aria-label="Luma yaşam hikâyesi"
    >
      <div ref={sticky} className="presentation-gallery-sticky">
        <div
          className="presentation-gallery-window"
          tabIndex={0}
          role="group"
          aria-label="Görsel hikâye; sağ ve sol ok tuşlarıyla gezinin"
          onKeyDown={(event) => {
            const target =
              event.key === 'ArrowRight'
                ? index + 1
                : event.key === 'ArrowLeft'
                  ? index - 1
                  : event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? slides.length - 1
                      : null
            if (target === null) return
            event.preventDefault()
            go(target)
          }}
        >
          <div
            ref={rail}
            className="presentation-gallery-rail"
            onScroll={() => {
              if (!pinned.current && rail.current && trackWidth.current === rail.current.clientWidth)
                select(
                  galleryIndex(
                    rail.current.scrollLeft / Math.max(1, rail.current.clientWidth * (slides.length - 1)),
                    slides.length,
                  ),
                )
            }}
          >
            {slides.map((slide, i) => (
              <figure
                key={slide.image}
                className="presentation-gallery-slide"
                role="group"
                aria-hidden={i !== index}
                aria-label={`${i + 1} / ${slides.length}: ${slide.title}`}
              >
                <img
                  src={slide.image}
                  srcSet={slide.mobileImage ? `${slide.mobileImage} 768w, ${slide.image} 1672w` : undefined}
                  sizes="100vw"
                  decoding="async"
                  alt={slide.title + ' — yapay zekâ destekli temsili mimari görselleştirme'}
                  loading="lazy"
                  width="1672"
                  height="941"
                  draggable={false}
                />
                <figcaption>
                  <span>0{i + 1} / LUMA AVLU</span>
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="presentation-gallery-controls">
          <p>
            <span className="gallery-desktop-hint">Aşağı kaydırarak hikâyede ilerleyin</span>
            <span className="gallery-mobile-hint">Yana kaydırın veya okları kullanın</span>
            <small>Yapay zekâ görselleştirmesi · Gerçek mülk veya manzara taahhüdü değildir</small>
            <button
              className="presentation-gallery-mode"
              aria-pressed={simple}
              onClick={() => setSimple(!simple)}
              title="Kaydırmaya bağlı yatay hareketi kapatır; görselleri oklarla inceleyebilirsiniz"
            >
              Sade görünüm
            </button>
          </p>
          <div>
            <button aria-label="Önceki görsel" disabled={index === 0} onClick={() => go(index - 1)}>
              <ArrowLeft size={20} />
            </button>
            <span aria-live="polite" aria-atomic="true">
              0{index + 1} / 0{slides.length}
            </span>
            <button
              aria-label="Sonraki görsel"
              disabled={index === slides.length - 1}
              onClick={() => go(index + 1)}
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
