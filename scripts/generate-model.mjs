// Original parametric concept architecture. No downloaded models or textures.
import { mkdir, writeFile } from 'node:fs/promises'
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three'
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { BASE_HEIGHT, BLOCK_X, FLOOR_HEIGHT, unitVolume } from '../src/domain/model-layout.ts'

// GLTFExporter uses the browser FileReader API even for texture-free binary data.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((result) => {
        this.result = result
        this.onloadend?.()
      })
      .catch((error) => this.onerror?.(error))
  }
}

const root = new Group()
root.name = 'Luma_Avlu_Concept_v2'
root.userData = {
  projectId: 'luma-avlu',
  units: 'metres',
  north: '-Z',
  purpose: 'concept-not-survey',
  version: 2,
}
const material = (name, color, roughness = 0.8, metalness = 0) => {
  const m = new MeshStandardMaterial({ color, roughness, metalness })
  m.name = name
  return m
}
const limestone = material('Limestone', '#d6d0bd')
const plaster = material('Ivory_plaster', '#f1e9d9')
const bronze = material('Bronze_frames', '#615447', 0.4, 0.65)
const wood = material('Thermowood', '#896346')
const glazing = material('Glazing', '#66828a', 0.12, 0.4)
const railing = material('Balcony_glass', '#b2cbcc', 0.22, 0.25)
railing.transparent = true
railing.opacity = 0.48
const lawn = material('Planting', '#637559')
const foliage = [material('Olive_green', '#56644b'), material('Olive_light', '#7b8962')]
const paving = material('Paving', '#c8c5b6')
const water = material('Pool_water', '#448c96', 0.12, 0.35)
const undercroft = material('Soffit', '#a99b85')
const light = material('Architectural_light', '#fff1d6', 0.35)
light.emissive.set('#ffce83')
light.emissiveIntensity = 0.2
const curtain = material('Linen_curtain', '#d8c7a9', 1)
const selection = material('Selection_volume', '#dbad69')
selection.transparent = true
selection.opacity = 0
const cube = new BoxGeometry(1, 1, 1)
const crown = new IcosahedronGeometry(1, 0)
const trunk = new CylinderGeometry(0.13, 0.24, 2.6, 6)
function box(parent, name, size, position, mat) {
  const mesh = new Mesh(cube, mat)
  mesh.name = name
  mesh.scale.set(...size)
  mesh.position.set(...position)
  parent.add(mesh)
  return mesh
}
function branch(parent, from, to, radius) {
  const a = new Vector3(...from),
    b = new Vector3(...to),
    direction = b.clone().sub(a)
  const mesh = new Mesh(new CylinderGeometry(radius * 0.55, radius, direction.length(), 6), wood)
  mesh.position.copy(a).add(b).multiplyScalar(0.5)
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), direction.normalize())
  parent.add(mesh)
}
box(root, 'Site_plinth', [72, 0.5, 58], [0, -0.25, 0], limestone)
box(root, 'Courtyard_paving', [69, 0.12, 55], [0, 0.06, 0], paving)
box(root, 'Pool_border', [10, 0.18, 23], [0, 0.17, 2], plaster)
box(root, 'Pool', [8.8, 0.08, 21.8], [0, 0.28, 2], water)
// Paving joints and a timber pool deck add scale without claiming a real site.
for (const x of [-12, 12]) box(root, 'Approach_path', [2, 0.04, 50], [x, 0.14, 0], plaster)
for (let z = -25; z < 26; z += 2) {
  for (const x of [-12, 12]) box(root, 'Paving_joint', [2, 0.006, 0.035], [x, 0.164, z], undercroft)
}
for (const x of [-6.4, 6.4]) {
  box(root, 'Timber_pool_deck', [2.8, 0.1, 23], [x, 0.18, 2], wood)
  for (let z = -9; z < 13.5; z += 0.4) box(root, 'Deck_joint', [2.8, 0.008, 0.018], [x, 0.234, z], bronze)
}
for (const x of [-32, 32]) box(root, 'Garden_bed', [4, 0.2, 50], [x, 0.16, 0], lawn)
for (const z of [-23, 24]) box(root, 'Garden_bed', [60, 0.2, 3], [0, 0.16, z], lawn)
for (let i = 0; i < 20; i++) {
  const x = i < 12 ? (i % 2 ? -32 : 32) : -26 + (i - 12) * 7.5
  const z = i < 12 ? -20 + Math.floor(i / 2) * 8 : i % 2 ? -23 : 24
  const t = new Mesh(trunk, wood)
  t.position.set(x, 1.5, z)
  root.add(t)
  for (let j = 0; j < 7; j++) {
    const angle = j * 2.4 + i * 0.7
    const bx = x + Math.cos(angle) * 1.35,
      bz = z + Math.sin(angle) * 1.35
    const by = 3.1 + (j % 3) * 0.48
    branch(root, [x, 2, z], [bx, by, bz], 0.1)
    for (let k = 0; k < 3; k++) {
      const c = new Mesh(crown, foliage[(i + j + k) % 2])
      c.position.set(bx + Math.sin(k * 2.1 + j) * 0.5, by + k * 0.28, bz + Math.cos(k * 2.1 + j) * 0.5)
      c.scale.set(0.85, 0.58, 0.8)
      c.rotation.set(j * 0.4, k * 1.3, i * 0.2)
      root.add(c)
    }
  }
}
for (const x of [-30, 30])
  for (let z = -18; z < 23; z += 6) {
    box(root, 'Path_bollard', [0.18, 0.8, 0.18], [x, 0.58, z], bronze)
    box(root, 'Path_light', [0.21, 0.09, 0.21], [x, 0.93, z], light)
  }
// Courtyard pavilion and seating: original simple architectural geometry.
for (const x of [-5, 5])
  for (const z of [-21, -15]) box(root, 'Pergola_post', [0.2, 3.2, 0.2], [x, 1.6, z], bronze)
for (let x = -5; x <= 5; x += 0.6) box(root, 'Pergola_louvre', [0.18, 0.25, 7], [x, 3.25, -18], wood)
for (const x of [-6.4, 6.4])
  for (let z = -6; z <= 10; z += 4) {
    box(root, 'Lounger_frame', [1.3, 0.3, 2.5], [x, 0.35, z], wood)
    box(root, 'Lounger_cushion', [1.2, 0.16, 2.3], [x, 0.58, z], plaster)
  }
for (const block of ['A', 'B']) {
  const building = new Group()
  building.name = `building-${block}`
  building.userData = { role: 'building', block }
  root.add(building)
  const bx = BLOCK_X[block]
  box(building, 'Foundation', [22.5, BASE_HEIGHT, 20.5], [bx, BASE_HEIGHT / 2, 0], limestone)
  for (let floor = 1; floor <= 6; floor++) {
    const level = new Group()
    level.name = `floor-${block}-${floor}`
    level.userData = { role: 'floor', floor, block }
    building.add(level)
    const base = BASE_HEIGHT + (floor - 1) * FLOOR_HEIGHT
    box(level, 'Terrace_slab', [23, 0.22, 21], [bx, base + 0.05, 0], plaster)
    box(level, 'Shadow_reveal', [22.65, 0.09, 20.65], [bx, base - 0.08, 0], undercroft)
    box(level, 'Central_core', [8, 3, 6], [bx, base + 1.6, 0], limestone)
    for (let position = 0; position < 4; position++) {
      const id = `luma-${block.toLowerCase()}-${String((floor - 1) * 4 + position + 1).padStart(2, '0')}`
      const unit = { block, floor, aspect: ['Güney', 'Doğu', 'Batı', 'Kuzey'][position] }
      const layout = unitVolume(unit)
      const volume = box(level, id, layout.size, layout.center, selection)
      volume.userData = { role: 'selection', unitId: id, block, floor }
      // Each apartment's facade remains associated with its stable inventory ID.
      const facade = new Group()
      facade.name = `facade-${id}`
      facade.userData = { role: 'facade', unitId: id, block, floor }
      const frontBack = position === 0 || position === 3
      facade.position.set(bx, base, 0)
      facade.rotation.y = layout.angle
      level.add(facade)
      const width = frontBack ? 20 : 6
      const depth = frontBack ? 8.9 : 9.9
      box(facade, 'Glazed_front', [width, 2.65, 0.12], [0, 1.7, depth], glazing)
      box(facade, 'Balcony_rail', [width + 0.6, 0.85, 0.07], [0, 0.75, depth + 1.5], railing)
      box(facade, 'Handrail', [width + 0.7, 0.06, 0.09], [0, 1.19, depth + 1.5], bronze)
      box(facade, 'Warm_light_strip', [width - 0.6, 0.035, 0.08], [0, 2.94, depth + 0.5], light)
      // Solid end panels and inset linen panels give the glazing a readable scale.
      box(facade, 'Stone_end_panel', [0.65, 2.9, 0.3], [-width / 2 + 0.45, 1.55, depth + 0.05], limestone)
      for (let k = 0; k < (frontBack ? 3 : 1); k++)
        box(
          facade,
          'Curtain_panel',
          [0.8, 2.55, 0.06],
          [-width / 2 + 1.5 + k * 6, 1.64, depth + 0.09],
          curtain,
        )
      if (frontBack) {
        box(facade, 'Balcony_planter', [2.2, 0.5, 0.55], [width / 2 - 1.8, 0.49, depth + 1.08], limestone)
        box(facade, 'Balcony_planting', [2.05, 0.25, 0.42], [width / 2 - 1.8, 0.86, depth + 1.08], lawn)
        box(facade, 'Balcony_seat', [1.1, 0.45, 0.65], [-width / 2 + 2.3, 0.44, depth + 0.75], wood)
      }
      const bays = frontBack ? 5 : 2
      for (let k = 0; k <= bays; k++) {
        const x = -width / 2 + (k * width) / bays
        box(facade, 'Stone_pier', [0.28, 3, 0.55], [x, 1.6, depth + 0.05], limestone)
        if (k < bays) {
          box(facade, 'Window_mullion', [0.07, 2.7, 0.14], [x + width / bays / 2, 1.7, depth + 0.08], bronze)
          if ((k + floor) % 3 === 0)
            for (let n = 0; n < 4; n++)
              box(facade, 'Timber_screen', [0.11, 2.6, 0.35], [x + 0.55 + n * 0.25, 1.7, depth + 0.32], wood)
        }
      }
    }
  }
  const roof = new Group()
  roof.name = `roof-${block}`
  roof.userData = { role: 'roof', block }
  building.add(roof)
  const y = BASE_HEIGHT + 6 * FLOOR_HEIGHT
  box(roof, 'Roof_slab', [23.5, 0.3, 21.5], [bx, y, 0], plaster)
  for (const z of [-10.3, 10.3]) box(roof, 'Parapet', [23, 0.65, 0.2], [bx, y + 0.38, z], limestone)
  for (const x of [-11.3, 11.3]) box(roof, 'Parapet', [0.2, 0.65, 20.5], [bx + x, y + 0.38, 0], limestone)
  box(roof, 'Roof_garden', [15, 0.16, 12], [bx, y + 0.22, 0], lawn)
  for (let n = 0; n < 8; n++) box(roof, 'Roof_pergola', [0.2, 0.28, 8], [bx - 3.5 + n, y + 2.4, 0], wood)
  for (const x of [-3.5, 3.5])
    for (const z of [-3.5, 3.5])
      box(roof, 'Roof_pergola_post', [0.16, 2.2, 0.16], [bx + x, y + 1.2, z], bronze)
}
// Merge static pieces per material within their semantic parent. Keep all 48
// selection meshes and facade/floor groups independently addressable.
function mergeStatic(group) {
  for (const child of [...group.children]) if (child instanceof Group) mergeStatic(child)
  const batches = new Map()
  for (const child of group.children) {
    if (!(child instanceof Mesh) || child.userData.role === 'selection') continue
    if (!batches.has(child.material)) batches.set(child.material, [])
    batches.get(child.material).push(child)
  }
  for (const [mat, meshes] of batches) {
    if (meshes.length < 2) continue
    // Planar UV projection in metres avoids stretching the stone across long slabs.
    const transformed = meshes.map((mesh) => {
      mesh.updateMatrix()
      let geometry = mesh.geometry.clone().applyMatrix4(mesh.matrix)
      if (geometry.index) {
        const unindexed = geometry.toNonIndexed()
        geometry.dispose()
        geometry = unindexed
      }
      const positions = geometry.getAttribute('position'),
        normals = geometry.getAttribute('normal'),
        uv = geometry.getAttribute('uv')
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i),
          y = positions.getY(i),
          z = positions.getZ(i)
        if (Math.abs(normals.getY(i)) > 0.5) uv.setXY(i, x / 2, z / 2)
        else if (Math.abs(normals.getX(i)) > 0.5) uv.setXY(i, z / 2, y / 2)
        else uv.setXY(i, x / 2, y / 2)
      }
      return geometry
    })
    const merged = mergeGeometries(transformed)
    if (!merged) throw new Error(`Cannot merge ${group.name}: ${mat.name}`)
    transformed.forEach((g) => g.dispose())
    meshes.forEach((mesh) => group.remove(mesh))
    const batch = new Mesh(merged, mat)
    batch.name = `${group.name}_${mat.name}`
    group.add(batch)
  }
}
mergeStatic(root)
root.updateMatrixWorld(true)
const buffer = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: false })
await mkdir(new URL('../public/models/', import.meta.url), { recursive: true })
await writeFile(new URL('../public/models/luma-avlu-v2.glb', import.meta.url), Buffer.from(buffer))
console.log(
  `Generated original Luma Avlu GLB: ${Math.round(buffer.byteLength / 1024)} KiB, 48 selection nodes.`,
)
