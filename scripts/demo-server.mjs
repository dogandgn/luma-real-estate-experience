import http from 'node:http'
import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.geojson': 'application/geo+json',
  '.glb': 'model/gltf-binary',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}
export async function serveDemo(rootPath, port = 4173) {
  const root = await realpath(rootPath)
  await stat(path.join(root, 'index.html'))
  const inside = (target) => {
    const rel = path.relative(root, target)
    return rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel)
  }
  const server = http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Cache-Control', 'no-cache')
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' })
      res.end()
      return
    }
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
      if (urlPath.includes('\0') || urlPath.includes('\\')) throw new Error('Invalid path')
      const candidate = path.resolve(root, `.${urlPath === '/' ? '/index.html' : urlPath}`)
      if (!inside(candidate)) throw new Error('Invalid path')
      const file = await realpath(candidate)
      if (!inside(file) || !(await stat(file)).isFile()) throw new Error('Invalid file')
      const info = await stat(file)
      res.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Content-Length': info.size,
      })
      if (req.method === 'HEAD') res.end()
      else
        createReadStream(file)
          .on('error', () => res.destroy())
          .pipe(res)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Dosya bulunamadı.')
    }
  })
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, '127.0.0.1', resolve)
  })
  return server
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.argv[2] || fileURLToPath(new URL('./site/', import.meta.url))
  const port = Number(process.argv[3] || 4173)
  if (!Number.isInteger(port) || port < 1024 || port > 65535)
    throw new Error('Port 1024-65535 aralığında olmalı.')
  try {
    await serveDemo(root, port)
    console.log(
      `Luma demo hazır: http://127.0.0.1:${port}/\nYalnızca bu bilgisayardan erişilir. Harita için internet gerekir.\nDurdurmak için Ctrl+C.`,
    )
  } catch (error) {
    console.error(
      error.code === 'EADDRINUSE'
        ? `Port ${port} kullanımda; başka uygulamayı kapatmadan farklı bir port seçin.`
        : error.message,
    )
    process.exitCode = 1
  }
}
