import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const root = path.resolve(process.argv[2] || '')
if (!process.argv[2]) throw new Error('Çıkarılmış paket klasörünü belirtin.')
const manifest = JSON.parse(await readFile(path.join(root, 'MANIFEST.json'), 'utf8'))
for (const file of manifest.files) {
  const target = path.resolve(root, file.path),
    relative = path.relative(root, target)
  assert.ok(
    relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    'Manifest dış dizine erişemez.',
  )
  const bytes = await readFile(target)
  assert.equal(bytes.length, file.bytes, file.path)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.path)
  assert.ok(!/(^|\/)(node_modules|\.git|\.env[^/]*|tmp|output)(\/|$)/.test(file.path), file.path)
  assert.ok(!/\.pdf$/i.test(file.path), 'Müşteri PDF dosyaları paketlenmemeli.')
}
async function count(dir) {
  let n = 0
  for (const file of await readdir(dir))
    n += (await stat(path.join(dir, file))).isDirectory() ? await count(path.join(dir, file)) : 1
  return n
}
assert.equal(await count(root), manifest.files.length + 1, 'Manifest dışında dosya var.')
console.log(`${manifest.files.length} dosyanın boyutu/SHA-256 değeri ve paket izin listesi doğrulandı.`)
