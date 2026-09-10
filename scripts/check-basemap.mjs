async function request(url, json = false) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  if (json) return response.json()
  const buffer = await response.arrayBuffer()
  if (!buffer.byteLength) throw new Error(`Empty resource: ${url}`)
  return buffer.byteLength
}
for (const styleName of ['positron', 'bright']) {
  const style = await request(`https://tiles.openfreemap.org/styles/${styleName}`, true)
  const fontNames = [
    ...new Set(
      style.layers
        .flatMap((layer) => layer.layout?.['text-font'] ?? [])
        .filter((value) => typeof value === 'string'),
    ),
  ]
  const source = Object.values(style.sources).find((s) => s.type === 'vector')
  if (!source) throw new Error('No vector source')
  const tileJSON = source.url ? await request(source.url, true) : source
  const z = 10
  const lon = 26.94
  const lat = (38.385 * Math.PI) / 180
  const x = Math.floor(((lon + 180) / 360) * 2 ** z)
  const y = Math.floor(((1 - Math.asinh(Math.tan(lat)) / Math.PI) / 2) * 2 ** z)
  const template = tileJSON.tiles?.[0]
  if (!template) throw new Error('No tile template')
  const tile = template.replace('{z}', z).replace('{x}', x).replace('{y}', y)
  const glyph = style.glyphs
    .replace('{fontstack}', encodeURIComponent('Noto Sans Regular'))
    .replace('{range}', '0-255')
  const [tileBytes, glyphBytes] = await Promise.all([request(tile), request(glyph)])
  console.log(
    JSON.stringify({
      style: styleName,
      fontNames,
      sampleTileBytes: tileBytes,
      glyphBytes,
      attribution: tileJSON.attribution,
    }),
  )
}
