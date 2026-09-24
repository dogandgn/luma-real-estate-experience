import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import media from './presentation-media.json'
import { getProjectPresentation } from './project-presentation'
import { projects } from './portfolio'

it('links the rendered stills to the actual selection model revision', () => {
  const project = projects.find((item) => item.id === media.projectId)!
  expect(project.modelUrl).toBe(media.model)
  const model = readFileSync(new URL(`../../public${media.model}`, import.meta.url))
  expect(createHash('sha256').update(model).digest('hex')).toBe(media.modelSha256)
  let total = 0
  for (const key of ['overview', 'facade', 'courtyard'] as const) {
    expect(getProjectPresentation(media.projectId)?.media?.[key]).toBe(media[key])
    const bytes = readFileSync(new URL(`../../public${media[key]}`, import.meta.url))
    expect(bytes.toString('ascii', 0, 4)).toBe('RIFF')
    expect(bytes.toString('ascii', 8, 12)).toBe('WEBP')
    total += bytes.length
  }
  expect(total).toBeLessThan(300 * 1024)
})
