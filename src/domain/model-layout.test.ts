import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Box3, Mesh, Raycaster, Vector3 } from 'three'
import { projects, units } from './portfolio'
import { pickUnit } from '../three/selection'
import { emptyUnitFilters, filterUnits, unitVolume } from './model-layout'

describe('3B envanter ve model sözleşmesi', () => {
  it('blok, kat, oda ve durum filtrelerini birlikte uygular; sıfır sonuç mümkün', () => {
    expect(filterUnits(units, emptyUnitFilters)).toHaveLength(48)
    expect(
      filterUnits(units, { block: 'B', floor: '6', room: '3+1', status: 'Satıldı' }).map((u) => u.number),
    ).toEqual(['B-24'])
    expect(filterUnits(units, { block: 'A', floor: '', room: '', status: 'Satıldı' })).toHaveLength(0)
  })
  it('48 benzersiz ve sonlu seçim hacmi üretir', () => {
    const centers = units.map((u) => unitVolume(u).center.join(','))
    expect(new Set(centers).size).toBe(48)
    for (const u of units) expect(unitVolume(u).size.every((n) => Number.isFinite(n) && n > 0)).toBe(true)
  })
  it('gerçek GLB dosyasını yükler ve 48 kimlik/hacim ile 12 katı doğrular', async () => {
    const modelUrl = projects.find((p) => p.id === 'luma-avlu')!.modelUrl!
    const bytes = readFileSync(new URL(`../../public${modelUrl}`, import.meta.url))
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67)
    expect(bytes.length).toBeLessThan(4 * 1024 * 1024)
    const jsonLength = bytes.readUInt32LE(12)
    const json = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString())
    expect(json.images ?? []).toHaveLength(0)
    expect(json.buffers.every((b: { uri?: string }) => !b.uri)).toBe(true)
    const result = await new GLTFLoader().parseAsync(
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
      '',
    )
    const root = result.scene
    root.updateMatrixWorld(true)
    let floorCount = 0,
      selectionCount = 0,
      meshCount = 0
    root.traverse((object) => {
      if (object.userData.role === 'floor') floorCount++
      if (object.userData.role === 'selection') selectionCount++
      if (object instanceof Mesh) meshCount++
    })
    expect(floorCount).toBe(12)
    expect(selectionCount).toBe(48)
    expect(meshCount).toBeLessThan(500)
    for (const unit of units) {
      const node = root.getObjectByName(unit.modelNodeId)
      expect(node, unit.id).toBeDefined()
      expect(node!.userData.unitId).toBe(unit.id)
      expect(node!.userData.floor).toBe(unit.floor)
      const actual = new Box3().setFromObject(node!).getCenter(new Vector3())
      const expected = unitVolume(unit).center
      expected.forEach((n, i) => expect(actual.getComponent(i)).toBeCloseTo(n, 4))
    }
    const selections: Mesh[] = []
    root.traverse((node) => {
      if (node instanceof Mesh && node.userData.role === 'selection') {
        node.layers.set(1)
        node.visible = false
        selections.push(node)
      }
    })
    const ray = new Raycaster(new Vector3(-18, 2.25, 30), new Vector3(0, 0, -1))
    const eligible = new Set(units.map((u) => u.id))
    expect(pickUnit(ray, selections, eligible)).toBe('luma-a-01')
    expect(pickUnit(ray, selections, new Set())).toBe(null)
    root.getObjectByName('building-A')!.visible = false
    expect(pickUnit(ray, selections, eligible)).toBe(null)
  })
})
