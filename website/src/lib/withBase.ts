/** Normalize Astro `base` + public path. Astro 6 may omit the trailing slash on BASE_URL. */
export function joinBase(base: string, path = ''): string {
  const root = base.endsWith('/') ? base : `${base}/`
  const trimmed = path.replace(/^\/+/, '')
  return trimmed ? `${root}${trimmed}` : root
}

export function withBase(path = ''): string {
  return joinBase(import.meta.env.BASE_URL, path)
}
