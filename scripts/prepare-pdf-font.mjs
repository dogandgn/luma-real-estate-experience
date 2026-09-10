// Copy an unmodified, redistributable DejaVu font and its embedded licence.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises'
const source = process.argv[2]
if (!source) throw new Error('Pass the absolute path to DejaVuSans.ttf')
const bytes = await readFile(source)
let nameOffset
for (let i = 0; i < bytes.readUInt16BE(4); i++) {
  const offset = 12 + i * 16
  if (bytes.toString('ascii', offset, offset + 4) === 'name') nameOffset = bytes.readUInt32BE(offset + 8)
}
if (!nameOffset) throw new Error('Font has no name table')
const count = bytes.readUInt16BE(nameOffset + 2),
  stringStart = nameOffset + bytes.readUInt16BE(nameOffset + 4)
const names = new Map()
for (let i = 0; i < count; i++) {
  const o = nameOffset + 6 + i * 12
  if (bytes.readUInt16BE(o) !== 3) continue
  const id = bytes.readUInt16BE(o + 6),
    length = bytes.readUInt16BE(o + 8),
    start = stringStart + bytes.readUInt16BE(o + 10)
  names.set(
    id,
    Buffer.from(bytes.subarray(start, start + length))
      .swap16()
      .toString('utf16le'),
  )
}
if (!names.get(1)?.includes('DejaVu') || !names.get(13)?.includes('Permission'))
  throw new Error('Expected DejaVu redistributable licence missing')
const output = new URL('../public/fonts/', import.meta.url)
await mkdir(output, { recursive: true })
await copyFile(source, new URL('DejaVuSans.ttf', output))
await writeFile(
  new URL('LICENSE-DejaVu.txt', output),
  `${names.get(0)}\n\n${names.get(13)}\n\n${names.get(14) || ''}\n`,
)
console.log('PDF font copied with its embedded copyright and licence.')
