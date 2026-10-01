/**
 * dsh-file-archive · safety guards (host side)
 *
 * Allowlist = the canonical roots of every registered workspace.
 * Denylist  = DSH data dir, this plugin's own dir, system dirs, and the
 *             critical hidden segments inside a workspace (.git / .dsh).
 *
 * Every destructive operation must pass `assertWithinWorkspace` first.
 */
import { realpath } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

/** This plugin's own directory (never touch). */
export const PLUGIN_DIR = resolve(dirname(fileURLToPath(import.meta.url)))

/** DSH data directory. */
export const DSH_DATA_DIR = resolve(homedir(), '.dsh')

/** System directories that must never be touched (Windows). */
export const SYSTEM_DIRS = [
  'C:\\Windows',
  'C:\\Program Files',
  'C:\\Program Files (x86)',
  'C:\\ProgramData',
]

/** Critical hidden segments inside a workspace root. */
export const DENIED_SEGMENTS = new Set(['.git', '.dsh'])

/** Batch operation limits. */
export const BATCH_LIMITS = Object.freeze({
  maxFiles: 500,
  maxTotalBytes: 2 * 1024 * 1024 * 1024, // 2 GiB
})

function isSameOrChild(child, parent) {
  const c = child.toLowerCase()
  const p = parent.toLowerCase()
  return c === p || c.startsWith(p.endsWith(sep) ? p : p + sep)
}

/** True when `target` sits inside (or is) a denylisted root. */
export function isDeniedRoot(target) {
  const norm = resolve(target)
  if (isSameOrChild(norm, PLUGIN_DIR)) return true
  if (isSameOrChild(norm, DSH_DATA_DIR)) return true
  for (const sys of SYSTEM_DIRS) {
    if (isSameOrChild(norm, sys)) return true
  }
  return false
}

/**
 * Resolve `target` to a canonical path and prove it belongs to one of the
 * given workspace roots, without touching a denylisted root or a critical
 * hidden segment. Returns the canonical path, or throws.
 *
 * @param {string} target
 * @param {string[]} roots  canonical workspace root paths
 * @returns {Promise<string>}
 */
export async function assertWithinWorkspace(target, roots) {
  if (typeof target !== 'string' || target.trim() === '') {
    throw new Error('empty path')
  }
  if (isDeniedRoot(target)) {
    throw new Error('denied path: ' + target)
  }
  let real
  try {
    real = await realpath(target)
  } catch {
    throw new Error('path does not exist: ' + target)
  }
  if (isDeniedRoot(real)) {
    throw new Error('denied path: ' + target)
  }
  const root = (roots || []).find((r) => {
    if (typeof r !== 'string' || r === '') return false
    return isSameOrChild(real, resolve(r))
  })
  if (!root) {
    throw new Error('outside workspace: ' + target)
  }
  const rel = relative(resolve(root), real)
  for (const seg of rel.split(sep)) {
    if (DENIED_SEGMENTS.has(seg)) {
      throw new Error('denied segment: ' + target)
    }
  }
  return real
}

/** Reject a batch that exceeds the configured limits. */
export function assertBatchLimits(files, totalBytes) {
  if (files > BATCH_LIMITS.maxFiles) {
    throw new Error(
      `too many files (${files}); limit is ${BATCH_LIMITS.maxFiles}`,
    )
  }
  if (totalBytes > BATCH_LIMITS.maxTotalBytes) {
    throw new Error(
      `batch too large (${totalBytes} bytes); limit is ${BATCH_LIMITS.maxTotalBytes}`,
    )
  }
}
