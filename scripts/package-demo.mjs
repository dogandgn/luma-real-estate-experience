import { cp, mkdir, readFile, readdir, writeFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const stamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace(/\.\d+Z$/, 'Z')
const output = path.join(root, 'releases', `luma-demo-${stamp}`)
const demo = path.join(output, 'luma-demo'),
  source = path.join(output, 'luma-source')
await stat(path.join(root, 'dist/index.html'))
await mkdir(demo, { recursive: true })
await mkdir(source)
await cp(path.join(root, 'dist'), path.join(demo, 'site'), { recursive: true })
await cp(path.join(root, 'scripts/demo-server.mjs'), path.join(demo, 'demo-server.mjs'))
// Explicit allowlist: never include private PDFs, temp files, .env, dependencies or report sources.
for (const name of [
  'src',
  'public',
  'scripts',
  'gis',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'README.md',
  'LICENSE',
  'PROJE-RAPORU.md',
  'PROGRESS.md',
  'ASSETS.md',
  'MEDIA-CONFIG.md',
  'UX-REVISION.md',
  'PDF-EXPORT.md',
  'DEMO-GUIDE.md',
  'PERFORMANCE.md',
]) {
  await cp(path.join(root, name), path.join(source, name), { recursive: true })
}
const guide = await readFile(path.join(root, 'DEMO-GUIDE.md'), 'utf8')
await writeFile(path.join(demo, 'ONCE-OKU.md'), guide)
await cp(path.join(root, 'PERFORMANCE.md'), path.join(demo, 'PERFORMANCE.md'))
await writeFile(
  path.join(demo, 'BASLAT.cmd'),
  '@echo off\r\ncd /d "%~dp0"\r\nwhere node >nul 2>nul\r\nif errorlevel 1 (\r\n echo Node.js 22.12 veya ustu gerekli. ONCE-OKU.md dosyasini okuyun.\r\n pause\r\n exit /b 1\r\n)\r\nnode demo-server.mjs\r\npause\r\n',
)
let licences = '# Third-party runtime notices\n\nSee site/fonts/LICENSE-DejaVu.txt for the PDF font.\n'
const seen = new Set()
async function collect(name, parent) {
  let dir = path.join(parent, 'node_modules', name)
  try {
    await stat(dir)
  } catch {
    dir = path.join(root, 'node_modules', name)
  }
  if (seen.has(dir)) return
  seen.add(dir)
  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8'))
  licences += `\n## ${pkg.name} ${pkg.version} (${pkg.license || 'see package'})\n`
  for (const file of await readdir(dir))
    if (/^(license|licence|copying|ofl)(\.|$|-)/i.test(file) && (await stat(path.join(dir, file))).isFile())
      licences += `\n${await readFile(path.join(dir, file), 'utf8')}\n`
  for (const dependency of Object.keys(pkg.dependencies || {})) await collect(dependency, dir)
  for (const dependency of Object.keys(pkg.optionalDependencies || {})) {
    try {
      await collect(dependency, dir)
    } catch (error) {
      if (error.code !== 'ENOENT') throw error
    }
  }
}
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
for (const name of Object.keys(pkg.dependencies)) await collect(name, root)
await writeFile(path.join(demo, 'THIRD-PARTY-NOTICES.txt'), licences)
await writeFile(path.join(source, 'THIRD-PARTY-NOTICES.txt'), licences)
async function hashes(dir, prefix = '') {
  const entries = []
  for (const file of (await readdir(dir, { withFileTypes: true })).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    const relative = prefix + file.name,
      absolute = path.join(dir, file.name)
    if (file.isDirectory()) entries.push(...(await hashes(absolute, relative + '/')))
    else {
      const bytes = await readFile(absolute)
      entries.push({
        path: relative,
        bytes: bytes.length,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      })
    }
  }
  return entries
}
for (const folder of [demo, source]) {
  const files = await hashes(folder)
  await writeFile(
    path.join(folder, 'MANIFEST.json'),
    JSON.stringify(
      {
        version: pkg.version,
        createdAt: new Date().toISOString(),
        scope: 'Local concept demo, not a real listing or client-specific sales product',
        files,
      },
      null,
      2,
    ),
  )
  const archive = folder + '.zip'
  if (process.platform !== 'win32')
    throw new Error('Bu paketleme komutu Windows PowerShell/.NET ZIP kullanır.')
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${folder.replaceAll("'", "''")}', '${archive.replaceAll("'", "''")}', [System.IO.Compression.CompressionLevel]::Optimal, $true)`,
    ],
    { stdio: 'inherit' },
  )
  console.log(JSON.stringify({ archive, bytes: (await stat(archive)).size, files: files.length }))
}
console.log(`Dağıtım çıktısı: ${output}`)
