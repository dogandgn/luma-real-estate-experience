import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { afterEach, expect, it } from 'vitest'
import { verifyRelease } from './verify-release.mjs'

const temporary = []
async function fixture(entries) {
  const root = await mkdtemp(path.join(tmpdir(), 'luma-release-test-'))
  temporary.push(root)
  const bytes = Buffer.from('demo')
  await writeFile(path.join(root, 'index.html'), bytes)
  await writeFile(
    path.join(root, 'MANIFEST.json'),
    JSON.stringify({
      files: entries ?? [
        { path: 'index.html', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') },
      ],
    }),
  )
  return root
}
afterEach(async () => {
  for (const root of temporary.splice(0)) await rm(root, { recursive: true, force: true })
})

it('verifies exact file counts, bytes and hashes', async () => {
  expect(await verifyRelease(await fixture())).toEqual({ files: 1, bytes: 4 })
})
it('rejects modified files even when their length is unchanged', async () => {
  const root = await fixture()
  await writeFile(path.join(root, 'index.html'), 'fake')
  await expect(verifyRelease(root)).rejects.toThrow('Özet uyuşmazlığı')
})
it('rejects files not declared in the manifest', async () => {
  const root = await fixture()
  await writeFile(path.join(root, '.env'), 'test-only')
  await expect(verifyRelease(root)).rejects.toThrow('Manifest dışında')
})
it('rejects missing files', async () => {
  const root = await fixture()
  await rm(path.join(root, 'index.html'))
  await expect(verifyRelease(root)).rejects.toThrow('Eksik dosyalar')
})
it.each([
  '../secret',
  '/absolute',
  'C:/secret',
  'sub/../../secret',
  'sub\\secret',
  '.env',
  'node_modules/file',
])('rejects unsafe manifest path %s', async (entry) => {
  await expect(verifyRelease(await fixture([{ path: entry, bytes: 0, sha256: '' }]))).rejects.toThrow()
})
