import { readFileSync } from 'node:fs'
import { createRef } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it } from 'vitest'
import { PresentationGallery } from '../components/PresentationGallery'
import { getProjectPresentation } from './project-presentation'

it('provides accessible manual controls and labels every cinematic concept', () => {
  const content = getProjectPresentation('luma-avlu')!
  const markup = renderToStaticMarkup(
    <PresentationGallery slides={content.cinematic!} scroller={createRef()} />,
  )
  expect(markup.match(/class="presentation-gallery-slide"/g)).toHaveLength(3)
  expect(markup).toContain('aria-label="Önceki görsel" disabled=""')
  expect(markup).toContain('aria-label="Sonraki görsel"')
  expect(markup).toContain('sağ ve sol ok tuşlarıyla gezinin')
  expect(markup).toContain('Gerçek mülk veya manzara taahhüdü değildir')
  expect(markup).toContain('Sade görünüm')
  expect(markup.match(/<figure[^>]*aria-hidden="true"/g)).toHaveLength(2)
  expect(markup).toContain('aria-roledescription="görsel galeri"')
  expect(markup).toContain('768w,')
  expect(markup).not.toContain('<canvas')
  expect(markup).not.toContain('<video')
})

it('uses local optimized cinematic assets without replacing the technical model stills', () => {
  const content = getProjectPresentation('luma-avlu')!
  expect(content.hero).toBe(content.cinematic![0].image)
  expect(content.media!.overview).toContain('model-overview.webp')
  let total = 0
  for (const slide of content.cinematic!) {
    const bytes = readFileSync(new URL(`../../public${slide.image}`, import.meta.url))
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF')
    expect(bytes.toString('ascii', 8, 12)).toBe('WEBP')
    total += bytes.length
  }
  expect(total).toBeLessThan(1100 * 1024)
})

it('provides a complete smaller image set for responsive delivery', () => {
  const content = getProjectPresentation('luma-avlu')!
  expect(content.heroMobile).toBe(content.cinematic![0].mobileImage)
  let total = 0
  for (const slide of content.cinematic!) {
    expect(slide.mobileImage).toBeTruthy()
    const mobile = readFileSync(new URL(`../../public${slide.mobileImage}`, import.meta.url))
    const full = readFileSync(new URL(`../../public${slide.image}`, import.meta.url))
    expect(mobile.toString('ascii', 8, 12)).toBe('WEBP')
    expect(mobile.length).toBeLessThan(full.length * 0.3)
    total += mobile.length
  }
  expect(total).toBeLessThan(250 * 1024)
})
