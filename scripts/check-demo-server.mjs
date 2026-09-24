import assert from 'node:assert/strict'
import path from 'node:path'
import { serveDemo } from './demo-server.mjs'
const server = await serveDemo(path.resolve('dist'), 0)
try {
  const base = `http://127.0.0.1:${server.address().port}`
  for (const [url, mime] of [
    ['/', 'text/html'],
    ['/models/luma-avlu-v2.glb', 'model/gltf-binary'],
    ['/fonts/DejaVuSans.ttf', 'font/ttf'],
    ['/images/luma-hero-realistic.webp', 'image/webp'],
    ['/images/luma-courtyard-realistic-768.webp', 'image/webp'],
  ]) {
    const res = await fetch(base + url)
    assert.equal(res.status, 200)
    assert.ok(res.headers.get('content-type').startsWith(mime))
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
    await res.arrayBuffer()
  }
  for (const url of ['/package.json', '/missing.js', '/%2e%2e%5cpackage.json', '/%00'])
    assert.equal((await fetch(base + url)).status, 404)
  assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405)
  assert.equal((await fetch(base + '/', { method: 'HEAD' })).status, 200)
  const imageHead = await fetch(base + '/images/luma-hero-realistic.webp', { method: 'HEAD' })
  assert.ok(Number(imageHead.headers.get('content-length')) > 0)
  assert.equal((await imageHead.arrayBuffer()).byteLength, 0)
  console.log(
    'Yerel sunucu: içerik türleri, HEAD, eksik dosya, dizin dışına erişim ve yöntem kontrolleri geçti.',
  )
} finally {
  server.closeAllConnections()
  await new Promise((resolve) => server.close(resolve))
}
