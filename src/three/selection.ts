import type { Mesh, Object3D, Raycaster } from 'three'

/** Layer 1 contains interaction volumes, even when their fill is visually hidden. */
export function pickUnit(raycaster: Raycaster, meshes: Mesh[], eligibleIds: Set<string>) {
  raycaster.layers.set(1)
  const candidates = meshes.filter((mesh) => {
    if (!eligibleIds.has(mesh.userData.unitId)) return false
    for (let parent: Object3D | null = mesh.parent; parent; parent = parent.parent)
      if (!parent.visible) return false
    return true
  })
  return (
    (raycaster.intersectObjects(candidates, false)[0]?.object.userData.unitId as string | undefined) ?? null
  )
}
