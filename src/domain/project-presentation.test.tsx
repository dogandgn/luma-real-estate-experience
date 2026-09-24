import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { getProjectPresentation } from './project-presentation'
import { projects } from './portfolio'
import { ProjectPresentation } from '../components/ProjectPresentation'

describe('project presentation', () => {
  it('enables the optional experience only for a configured portfolio project', () => {
    expect(projects.filter((project) => getProjectPresentation(project.id)).map((p) => p.id)).toEqual([
      'luma-avlu',
    ])
    expect(getProjectPresentation('missing')).toBeUndefined()
    expect(getProjectPresentation('toString')).toBeUndefined()
  })

  it('uses shared inventory values and labels concept imagery and location honestly', () => {
    const project = projects.find((p) => p.id === 'luma-avlu')!
    const content = getProjectPresentation(project.id)!
    const markup = renderToStaticMarkup(
      <ProjectPresentation
        project={{ ...project, totalUnits: 61, availableUnits: 17 }}
        content={content}
        onClose={() => {}}
        onLocation={() => {}}
        onSelectUnit={() => {}}
      />,
    )
    expect(markup).toContain('17 uygun daire / 61 konut')
    expect(markup).toContain('aria-labelledby="presentation-title"')
    expect(markup.match(/data-chapter=/g)).toHaveLength(5)
    expect(markup).toContain('3B daire seçimine geç')
    expect(markup).toContain('Yapay zekâ ile üretilmiş temsili konsept')
    expect(markup).toContain('herhangi bir parseli veya mülkiyeti hedef almaz')
    expect(markup).toContain('Gerçek donatı verisi henüz bağlı değildir')
    expect(markup).toContain('Mimari modeli aç')
    expect(markup).not.toContain('presentation-model-canvas')
  })

  it('does not offer a model preview when the project has no model', () => {
    const project = projects.find((p) => p.id === 'luma-avlu')!
    const markup = renderToStaticMarkup(
      <ProjectPresentation
        project={{ ...project, modelUrl: null }}
        content={getProjectPresentation(project.id)!}
        onClose={() => {}}
        onLocation={() => {}}
        onSelectUnit={() => {}}
      />,
    )
    expect(markup).not.toContain('Mimari modeli aç')
    expect(markup).toContain('Haritada konumu incele')
  })
})
