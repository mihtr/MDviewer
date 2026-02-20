/**
 * Returns true if the filename has a recognised Markdown extension.
 */
export function isMarkdown(name: string): boolean {
  const MD_EXTENSIONS = new Set(['.md', '.markdown', '.mdx', '.txt'])
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  return MD_EXTENSIONS.has(ext)
}

/**
 * Resolves a potentially relative image src to an absolute file:// URL.
 * Absolute URLs (http/https/file/data) are returned unchanged.
 */
export function resolveImageSrc(src: string | undefined, basePath: string | null): string {
  if (!src) return ''
  if (/^(https?|file|data):/.test(src)) return src
  if (!basePath) return src
  const base = basePath.replace(/\\/g, '/')
  const rel = src.replace(/\\/g, '/')
  return `file:///${base}/${rel}`
}

/**
 * Returns the parent directory of a file path.
 */
export function parentDir(filePath: string): string {
  return filePath.replace(/[\\/][^\\/]+$/, '')
}

// ── Recent files (localStorage) ──────────────────────────────

import type { RecentEntry } from './types'

const RECENT_KEY = 'mdviewer-recent'
const RECENT_MAX = 10

export function getRecent(): RecentEntry[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addRecent(entry: Omit<RecentEntry, 'openedAt'>): void {
  const items = getRecent().filter(e => e.path !== entry.path)
  items.unshift({ ...entry, openedAt: Date.now() })
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_MAX)))
}
