import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projects = JSON.parse(await readFile(path.join(root, 'src/data/projects.json'), 'utf8'))
const collection = {
  type: 'FeatureCollection',
  features: projects.map((p) => ({
    type: 'Feature',
    id: p.id,
    geometry: { type: 'Point', coordinates: p.regionalPoint },
    properties: {
      project_id: p.id,
      name: p.name,
      district: p.district,
      location_mode: p.locationMode,
      is_demo: true,
      available_units: p.availableUnits,
      total_units: p.totalUnits,
      note: 'Temsili bölge noktasıdır. Parsel veya gerçek satış konumu değildir.',
    },
  })),
}
await mkdir(path.join(root, 'public/data'), { recursive: true })
await writeFile(path.join(root, 'public/data/projects.geojson'), JSON.stringify(collection, null, 2) + '\n')
console.log(`Exported ${collection.features.length} regional project records to public/data/projects.geojson`)
