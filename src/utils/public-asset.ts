/** Resolve files from Vite's public directory in local, preview and GitHub Pages builds. */
export function publicAsset(path: string): string {
  if (!path.startsWith('/')) return path
  return `${import.meta.env.BASE_URL}${path.slice(1)}`
}
