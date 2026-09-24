import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { lstat, readFile, readdir, realpath } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export async function verifyRelease(directory) {
  const root = await realpath(directory)
  const manifest = JSON.parse(await readFile(path.join(root, 'MANIFEST.json'), 'utf8'))
  assert.ok(Array.isArray(manifest.files) && manifest.files.length, 'Manifest dosya listesi eksik')
  const expected = new Map()
  for (const entry of manifest.files) {
    assert.equal(typeof entry.path, 'string', 'Geçersiz dosya yolu')
    const parts = entry.path.split('/')
    assert.ok(
      !entry.path.includes('\\') &&
        !entry.path.includes(':') &&
        parts.every((part) => part && part !== '.' && part !== '..'),
      'Güvensiz dosya yolu',
    )
    assert.ok(
      !parts.some((part) => /^(\.env(?:\.|$)|node_modules$|\.git$)/i.test(part)),
      'Paket dışında kalması gereken dosya',
    )
    assert.notEqual(entry.path, 'MANIFEST.json', 'Manifest kendisini kapsayamaz')
    assert.ok(!expected.has(entry.path), 'Tekrarlı manifest kaydı')
    expected.set(entry.path, entry)
  }
  let bytes = 0
  let files = 0
  async function visit(folder, prefix = '') {
    for (const item of await readdir(folder)) {
      const relative = prefix + item
      const absolute = path.join(folder, item)
      const info = await lstat(absolute)
      assert.ok(!info.isSymbolicLink(), `Sembolik bağlantı kabul edilmez: ${relative}`)
      if (info.isDirectory()) await visit(absolute, relative + '/')
      else if (relative !== 'MANIFEST.json') {
        assert.ok(info.isFile(), `Normal dosya değil: ${relative}`)
        const entry = expected.get(relative)
        assert.ok(entry, `Manifest dışında dosya: ${relative}`)
        const content = await readFile(absolute)
        assert.equal(content.length, entry.bytes, `Boyut uyuşmazlığı: ${relative}`)
        assert.equal(
          createHash('sha256').update(content).digest('hex'),
          entry.sha256,
          `Özet uyuşmazlığı: ${relative}`,
        )
        expected.delete(relative)
        bytes += content.length
        files++
      }
    }
  }
  await visit(root)
  assert.equal(expected.size, 0, `Eksik dosyalar: ${[...expected.keys()].join(', ')}`)
  return { files, bytes }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2])
    throw new Error('Kullanım: node scripts/verify-release.mjs <çıkarılmış paket klasörü>')
  console.log(JSON.stringify(await verifyRelease(process.argv[2])))
}
