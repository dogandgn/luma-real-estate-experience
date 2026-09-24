import { expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { PresentationModel } from '../components/PresentationModel'
import { projects } from './portfolio'

it('offers accessible camera choices without creating WebGL before the component is visible', () => {
  const project = projects.find((item) => item.id === 'luma-avlu')!
  const markup = renderToStaticMarkup(
    <PresentationModel modelUrl={project.modelUrl!} projectId={project.id} active={false} />,
  )
  expect(markup).toContain('Mimari kamera açıları')
  expect(markup).toContain('Genel görünüm')
  expect(markup).toContain('Avlu')
  expect(markup).toContain('Cephe')
  expect(markup).toContain('Mimari görünüm duraklatıldı.')
  expect(markup).toContain('fotogerçekçi render değildir')
  expect(markup.match(/disabled=""/g)).toHaveLength(5)
  expect(markup).toContain('Bu görünümü indir')
  expect(markup).not.toContain('<canvas')
})
