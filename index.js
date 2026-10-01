/**
 * dsh-file-archive · host half
 *
 * A Cordis bundle plugin that mounts a private HTTP API under
 * `/dsh-file-archive/*` for the browser client half. Every destructive
 * operation is gated by guards.js (workspace allowlist + denylist + limits).
 */
import { execFile } from 'node:child_process'
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  statfs,
  writeFile,
} from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { basename, dirname, extname, join, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import {
  assertBatchLimits,
  assertWithinWorkspace,
  isDeniedRoot,
  PLUGIN_DIR,
} from './guards.js'
import { createZip, extractZip as unzipTo } from './zip.js'

const execFileP = promisify(execFile)

function isSameOrChild(child, parent) {
  const c = resolve(child).toLowerCase()
  const p = resolve(parent).toLowerCase()
  return c === p || c.startsWith(p.endsWith(sep) ? p : p + sep)
}

export const name = 'dsh-file-archive'
export const inject = ['webServer']

const BASE = '/dsh-file-archive'
const LOG_FILE = join(PLUGIN_DIR, 'deletion-log.json')

const MAX_TEXT_BYTES = 2 * 1024 * 1024 // 2 MiB text preview
const MAX_READ_BYTES = 32 * 1024 * 1024 // 32 MiB binary preview
const OFFICE_EXT = new Set(['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'])

const MIME = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  avif: 'image/avif',
  txt: 'text/plain; charset=utf-8',
  md: 'text/plain; charset=utf-8',
  json: 'application/json',
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
}

/** Well-known system directory names filtered from the move-dialog picker. */
const SYSTEM_DIR_NAMES = new Set([
  'windows',
  'program files',
  'program files (x86)',
  'programdata',
  '$recycle.bin',
  'system volume information',
  'recovery',
  'perflogs',
  'config.msi',
  'documents and settings',
  'pagefile.sys',
])

/* ------------------------------------------------------------------ *
 * HTTP helpers
 * ------------------------------------------------------------------ */

function sendJson(res, status, body) {
  const data = JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(data),
  })
  res.end(data)
}

function sendBytes(res, status, bytes, type = 'application/octet-stream') {
  const buf = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes)
  res.writeHead(status, {
    'content-type': type,
    'content-length': buf.byteLength,
    'cache-control': 'no-store',
  })
  res.end(buf)
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (c) => {
      size += c.length
      if (size > 8 * 1024 * 1024) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(c)
    })
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {})
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

/* ------------------------------------------------------------------ *
 * Workspace roots
 * ------------------------------------------------------------------ */

function workspaceRoots(ctx) {
  const registry = ctx.get('workspaceRegistry')
  const list = typeof registry?.list === 'function' ? registry.list() : []
  const roots = []
  const seen = new Set()
  for (const ws of list) {
    const p = typeof ws?.path === 'string' ? resolve(ws.path) : null
    if (p && !seen.has(p)) {
      seen.add(p)
      roots.push(p)
    }
  }
  return roots
}

function workspaceList(ctx) {
  const registry = ctx.get('workspaceRegistry')
  const list = typeof registry?.list === 'function' ? registry.list() : []
  return list
    .filter((ws) => typeof ws?.path === 'string')
    .map((ws) => ({
      id: String(ws.id ?? ''),
      path: resolve(ws.path),
      title: typeof ws.title === 'string' ? ws.title : basename(ws.path),
    }))
}

/* ------------------------------------------------------------------ *
 * Read / browse / preview
 * ------------------------------------------------------------------ */

function entryOf(dirent) {
  return {
    name: dirent.name,
    type: dirent.isDirectory() ? 'directory' : dirent.isFile() ? 'file' : 'other',
  }
}

async function browseDir(ctx, path) {
  const roots = workspaceRoots(ctx)
  const real = await assertWithinWorkspace(path, roots)
  const st = await stat(real)
  if (!st.isDirectory()) throw new Error('not a directory: ' + path)
  const dirents = await readdir(real, { withFileTypes: true })
  const entries = await Promise.all(
    dirents.map(async (d) => {
      const e = entryOf(d)
      if (e.type !== 'file') return e
      try {
        const s = await stat(join(real, d.name))
        e.size = s.size
        e.mtime = s.mtimeMs
      } catch {
        /* raced deletion — leave size/mtime undefined */
      }
      return e
    }),
  )
  // directories first, then files, then alphabetical (case-insensitive)
  entries.sort((a, b) => {
    const ta = a.type === 'directory' ? 0 : 1
    const tb = b.type === 'directory' ? 0 : 1
    if (ta !== tb) return ta - tb
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
  return { path: real, entries }
}

async function statFile(ctx, path) {
  const roots = workspaceRoots(ctx)
  const real = await assertWithinWorkspace(path, roots)
  const st = await stat(real)
  return {
    path: real,
    name: basename(real),
    ext: extname(real).slice(1).toLowerCase(),
    size: st.size,
    mtime: st.mtimeMs,
    isDirectory: st.isDirectory(),
  }
}

async function readTextFile(ctx, path) {
  const roots = workspaceRoots(ctx)
  const real = await assertWithinWorkspace(path, roots)
  const st = await stat(real)
  if (st.size > MAX_TEXT_BYTES) {
    const fd = await readFile(real)
    return { text: fd.subarray(0, MAX_TEXT_BYTES).toString('utf8'), truncated: true, size: st.size }
  }
  return { text: await readFile(real, 'utf8'), truncated: false, size: st.size }
}

function isBinary(buf) {
  const n = Math.min(buf.length, 8000)
  for (let i = 0; i < n; i++) {
    if (buf[i] === 0) return true
  }
  return false
}

async function searchContent(ctx, root, query, caseSensitive) {
  const roots = workspaceRoots(ctx)
  const rootReal = await assertWithinWorkspace(root, roots)
  if (typeof query !== 'string' || !query.trim()) throw new Error('empty query')
  const q = caseSensitive ? query : query.toLowerCase()
  const SKIP_DIRS = new Set(['node_modules', '.git', '.dsh', 'dist', 'build', '.next', '.cache'])
  const MAX_FILES = 5000
  const MAX_SIZE = 2 * 1024 * 1024
  const MAX_MATCHES = 200
  const matches = []
  let scanned = 0

  async function walk(dir) {
    if (matches.length >= MAX_MATCHES || scanned >= MAX_FILES) return
    let dirents
    try {
      dirents = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const d of dirents) {
      if (matches.length >= MAX_MATCHES || scanned >= MAX_FILES) return
      const full = join(dir, d.name)
      if (d.isDirectory()) {
        if (SKIP_DIRS.has(d.name) || d.name.startsWith('.')) continue
        await walk(full)
      } else if (d.isFile()) {
        scanned++
        try {
          const s = await stat(full)
          if (s.size > MAX_SIZE) continue
          const buf = await readFile(full)
          if (isBinary(buf)) continue
          const lines = buf.toString('utf8').split('\n')
          for (let i = 0; i < lines.length; i++) {
            const hay = caseSensitive ? lines[i] : lines[i].toLowerCase()
            if (hay.includes(q)) {
              matches.push({ path: full, line: i + 1, text: lines[i].trim().slice(0, 300) })
              if (matches.length >= MAX_MATCHES) return
            }
          }
        } catch {
          /* skip unreadable */
        }
      }
    }
  }
  await walk(rootReal)
  return { matches, truncated: matches.length >= MAX_MATCHES }
}

async function readBytesFile(ctx, path) {
  const roots = workspaceRoots(ctx)
  const real = await assertWithinWorkspace(path, roots)
  const st = await stat(real)
  if (st.size > MAX_READ_BYTES) throw new Error('file too large to preview')
  return await readFile(real)
}

async function renderDocument(ctx, path) {
  const roots = workspaceRoots(ctx)
  const real = await assertWithinWorkspace(path, roots)
  const ext = extname(real).slice(1).toLowerCase()
  if (!OFFICE_EXT.has(ext)) throw new Error('not an Office file: ' + ext)
  const converter = ctx.get('officeToPdf')
  if (!converter || typeof converter.convert !== 'function') {
    throw new Error('officeToPdf service unavailable')
  }
  const st = await stat(real)
  const version = String(st.mtimeMs) + ':' + st.size
  const result = await converter.convert({
    extension: ext,
    priority: 'foreground',
    source: {
      key: real,
      version,
      bytes: st.size,
      read: async () => ({ bytes: await readFile(real), version }),
    },
  })
  return result.pdf
}

/* ------------------------------------------------------------------ *
 * Destructive operations (all gated)
 * ------------------------------------------------------------------ */

function psQuote(s) {
  return "'" + s.replace(/'/g, "''") + "'"
}

async function deleteToRecycleBin(ctx, paths) {
  const roots = workspaceRoots(ctx)
  const entries = []
  let total = 0
  for (const p of paths) {
    const real = await assertWithinWorkspace(p, roots)
    const st = await lstat(real)
    if (st.isDirectory()) {
      entries.push({ real, isDir: true, size: st.size || 0 })
    } else if (st.isFile()) {
      entries.push({ real, isDir: false, size: st.size || 0 })
      total += st.size || 0
    } else {
      throw new Error('unsupported entry: ' + p)
    }
  }
  assertBatchLimits(entries.length, total)

  const lines = ['Add-Type -AssemblyName Microsoft.VisualBasic']
  for (const e of entries) {
    const q = psQuote(e.real)
    lines.push(
      e.isDir
        ? `[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteDirectory(${q},'OnlyErrorDialogs','SendToRecycleBin')`
        : `[Microsoft.VisualBasic.FileIO.FileSystem]::DeleteFile(${q},'OnlyErrorDialogs','SendToRecycleBin')`,
    )
  }
  await execFileP(
    'powershell.exe',
    ['-NoProfile', '-NonInteractive', '-Command', lines.join(';\n')],
    { timeout: 300000, maxBuffer: 16 * 1024 * 1024 },
  )
  await appendDeletionLog(entries)
  return entries.map((e) => e.real)
}

async function appendOp(records) {
  let log = { items: [] }
  try {
    log = JSON.parse(await readFile(LOG_FILE, 'utf8'))
    if (!Array.isArray(log.items)) log = { items: [] }
  } catch {
    /* first run */
  }
  log.items = [...records, ...log.items].slice(0, 1000)
  try {
    await mkdir(PLUGIN_DIR, { recursive: true })
    await writeFileAtomic(LOG_FILE, JSON.stringify(log))
  } catch {
    /* logging is best-effort, never fail the operation */
  }
}

async function appendDeletionLog(entries) {
  const now = Date.now()
  await appendOp(entries.map((e) => ({
    type: 'delete',
    path: e.real,
    name: basename(e.real),
    isDir: e.isDir,
    size: e.size,
    deletedAt: now,
  })))
}

async function writeFileAtomic(file, data) {
  await writeFile(file, data, 'utf8')
}

async function readDeletionLog() {
  try {
    const log = JSON.parse(await readFile(LOG_FILE, 'utf8'))
    const items = Array.isArray(log.items) ? log.items : []
    return items.filter((it) => it.type === 'delete' || !it.type)
  } catch {
    return []
  }
}

async function readOperationLog() {
  try {
    const log = JSON.parse(await readFile(LOG_FILE, 'utf8'))
    return Array.isArray(log.items) ? log.items : []
  } catch {
    return []
  }
}

/* ---- job-based transfer (move / copy) with progress + cancel ---- */
const jobs = new Map()
let jobSeq = 0

function createJob() {
  const id = 'j' + (++jobSeq)
  const job = {
    id,
    state: 'running',
    filesDone: 0,
    filesTotal: 0,
    bytesDone: 0,
    bytesTotal: 0,
    current: '',
    error: null,
    results: [],
    abort: new AbortController(),
  }
  jobs.set(id, job)
  return job
}

function getJob(id) {
  return jobs.get(id)
}

async function freeBytesOf(path) {
  try {
    const s = await statfs(path)
    if (typeof s.bavail === 'number' && typeof s.bsize === 'number') {
      return s.bavail * s.bsize
    }
  } catch {
    /* statfs unavailable — caller treats as unknown */
  }
  return null
}

function isCrossDevice(src, dest) {
  const a = resolve(src)
  const b = resolve(dest)
  if (/^[a-zA-Z]:/.test(a) && /^[a-zA-Z]:/.test(b)) {
    return a[0].toLowerCase() !== b[0].toLowerCase()
  }
  return false
}

async function resolveDest(dir, name, conflict) {
  const target = join(dir, name)
  const exists = await stat(target).catch(() => null)
  if (!exists) return target
  if (conflict === 'skip') return null
  if (conflict === 'overwrite') {
    await rm(target, { recursive: true, force: true })
    return target
  }
  if (conflict === 'rename') {
    const ext = extname(name)
    const base = name.slice(0, name.length - ext.length)
    for (let i = 1; i < 10000; i++) {
      const candidate = join(dir, `${base} (${i})${ext}`)
      if (!(await stat(candidate).catch(() => null))) return candidate
    }
    throw new Error('cannot resolve a unique name')
  }
  throw new Error('destination already exists: ' + target)
}

async function walkBytes(src) {
  const st = await lstat(src)
  if (st.isFile()) {
    return { files: 1, bytes: st.size, list: [{ src, rel: basename(src) }], dirs: [], isDir: false }
  }
  const list = []
  const dirs = []
  let files = 0
  let bytes = 0
  async function walk(dir, rel) {
    const dirents = await readdir(dir, { withFileTypes: true })
    for (const d of dirents) {
      const full = join(dir, d.name)
      const r = rel ? rel + sep + d.name : d.name
      if (d.isDirectory()) {
        dirs.push(r)
        await walk(full, r)
      } else if (d.isFile()) {
        const s = await stat(full)
        files++
        bytes += s.size
        list.push({ src: full, rel: r })
      }
    }
  }
  await walk(src, '')
  return { files, bytes, list, dirs, isDir: true }
}

function streamCopy(src, dst, job, signal) {
  return new Promise((resolve, reject) => {
    const rs = createReadStream(src)
    const ws = createWriteStream(dst)
    rs.on('data', (c) => {
      job.bytesDone += c.length
      if (signal.aborted) {
        rs.destroy()
        ws.destroy()
        reject(new Error('cancelled'))
      }
    })
    rs.on('error', reject)
    ws.on('error', reject)
    ws.on('finish', () => {
      job.filesDone++
      resolve()
    })
    rs.pipe(ws)
  })
}

async function copyTree(src, dest, w, job, signal) {
  for (const d of w.dirs) {
    await mkdir(join(dest, d), { recursive: true })
  }
  for (const f of w.list) {
    if (signal.aborted) throw new Error('cancelled')
    job.current = f.src
    const target = join(dest, f.rel)
    await mkdir(dirname(target), { recursive: true })
    await streamCopy(f.src, target, job, signal)
  }
}

async function transferPath(ctx, src, destReal, mode, conflict, job, w) {
  const roots = workspaceRoots(ctx)
  const srcReal = await assertWithinWorkspace(src, roots)
  const dest = await resolveDest(destReal, basename(srcReal), conflict)
  if (dest === null) {
    return { from: srcReal, to: null, skipped: true }
  }
  job.filesTotal += w.files
  job.bytesTotal += w.bytes

  if (mode === 'move') {
    try {
      await rename(srcReal, dest)
      job.filesDone += w.files
      job.bytesDone += w.bytes
      await appendOp([{ type: 'move', path: srcReal, dest, movedAt: Date.now() }])
      return { from: srcReal, to: dest, skipped: false }
    } catch (err) {
      if (err.code !== 'EXDEV') throw err
      // cross-device: fall through to copy + delete
    }
  }
  await copyTree(srcReal, dest, w, job, job.abort.signal)
  if (mode === 'move') {
    await rm(srcReal, { recursive: true, force: true })
  }
  const atKey = mode === 'move' ? 'movedAt' : 'copiedAt'
  await appendOp([{ type: mode, path: srcReal, dest, [atKey]: Date.now() }])
  return { from: srcReal, to: dest, skipped: false }
}

async function enqueueTransfer(ctx, paths, destDir, mode, conflict) {
  const roots = workspaceRoots(ctx)
  const destReal = await resolveExistingDir(destDir)
  const tasks = []
  let totalBytes = 0
  for (const p of paths) {
    const srcReal = await assertWithinWorkspace(p, roots)
    if (isSameOrChild(join(destReal, basename(srcReal)), srcReal)) {
      throw new Error('cannot place a folder inside itself')
    }
    const w = await walkBytes(srcReal)
    totalBytes += w.bytes
    tasks.push({ src: srcReal, w })
  }
  if (totalBytes > 0) {
    const cross = tasks.some((t) => isCrossDevice(t.src, destReal))
    if (mode === 'copy' || cross) {
      const free = await freeBytesOf(destReal)
      if (free !== null && totalBytes > free) {
        throw new Error(`not enough free space on destination (need ${totalBytes} bytes, have ${free})`)
      }
    }
  }
  const job = createJob()
  ;(async () => {
    try {
      for (const t of tasks) {
        if (job.abort.signal.aborted) break
        job.current = t.src
        const r = await transferPath(ctx, t.src, destReal, mode, conflict, job, t.w)
        job.results.push(r)
      }
      job.state = job.abort.signal.aborted ? 'cancelled' : 'done'
    } catch (err) {
      const cancelled = job.abort.signal.aborted || String(err?.message || err) === 'cancelled'
      job.state = cancelled ? 'cancelled' : 'error'
      job.error = cancelled ? null : String(err?.message || err)
    } finally {
      setTimeout(() => jobs.delete(job.id), 60000)
    }
  })()
  return job.id
}

async function renamePath(ctx, path, newName) {
  const roots = workspaceRoots(ctx)
  const srcReal = await assertWithinWorkspace(path, roots)
  if (typeof newName !== 'string' || !newName.trim() || /[\\/:*?"<>|]/.test(newName)) {
    throw new Error('invalid name')
  }
  const trimmed = newName.trim()
  if (trimmed === basename(srcReal)) {
    return { from: srcReal, to: srcReal, unchanged: true }
  }
  const destPath = join(dirname(srcReal), trimmed)
  const exists = await stat(destPath).catch(() => null)
  if (exists) throw new Error('destination already exists: ' + destPath)
  await rename(srcReal, destPath)
  await appendOp([{ type: 'rename', path: srcReal, dest: destPath, renamedAt: Date.now() }])
  return { from: srcReal, to: destPath }
}

async function openRecycleBin() {
  await execFileP('explorer.exe', ['shell:RecycleBinFolder'], { timeout: 10000 }).catch(() => {
    /* best-effort open */
  })
}

async function compressPaths(ctx, paths, destDir, zipName, conflict) {
  const roots = workspaceRoots(ctx)
  const srcs = []
  for (const p of paths) srcs.push(await assertWithinWorkspace(p, roots))
  const destReal = await resolveExistingDir(destDir)
  const name = (typeof zipName === 'string' && zipName.trim() ? zipName.trim() : 'archive') + '.zip'
  const dest = await resolveDest(destReal, name, conflict)
  if (dest === null) return { skipped: true, to: null }
  const result = await createZip(srcs, dest)
  await appendOp([{ type: 'compress', path: dest, name: basename(dest), dest, compressedAt: Date.now() }])
  return { skipped: false, to: dest, entries: result.entries }
}

async function extractZip(ctx, zipPath, destDir, conflict) {
  const roots = workspaceRoots(ctx)
  const zipReal = await assertWithinWorkspace(zipPath, roots)
  const destReal = await resolveExistingDir(destDir)
  const base = basename(zipReal).replace(/\.zip$/i, '') || 'extracted'
  const target = await resolveDest(destReal, base, conflict)
  if (target === null) return { skipped: true, to: null }
  await unzipTo(zipReal, target)
  await appendOp([{ type: 'extract', path: zipReal, dest: target, extractedAt: Date.now() }])
  return { skipped: false, to: target }
}

async function browseAnyDir(path) {
  let real
  try {
    real = await realpath(path)
  } catch {
    throw new Error('path does not exist: ' + path)
  }
  if (isDeniedRoot(real)) throw new Error('denied path: ' + path)
  const st = await stat(real)
  if (!st.isDirectory()) throw new Error('not a directory: ' + path)
  const atDriveRoot = /^[a-zA-Z]:$/.test(real.replace(/[\\/]+$/, ''))
  const dirents = await readdir(real, { withFileTypes: true })
  const entries = dirents
    .filter((d) => {
      if (!(d.isDirectory() || d.isFile())) return false
      if (atDriveRoot && d.isDirectory() && SYSTEM_DIR_NAMES.has(d.name.toLowerCase())) return false
      return true
    })
    .map((d) => ({ name: d.name, type: d.isDirectory() ? 'directory' : 'file' }))
  entries.sort((a, b) => {
    const ta = a.type === 'directory' ? 0 : 1
    const tb = b.type === 'directory' ? 0 : 1
    if (ta !== tb) return ta - tb
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })
  return { path: real, entries }
}

async function resolveExistingDir(dir) {
  let real
  try {
    real = await realpath(dir)
  } catch {
    throw new Error('destination does not exist: ' + dir)
  }
  if (isDeniedRoot(real)) throw new Error('denied destination: ' + dir)
  const st = await stat(real)
  if (!st.isDirectory()) throw new Error('destination is not a directory: ' + dir)
  return real
}

async function makeDirectory(parent, name) {
  if (typeof name !== 'string' || !name.trim() || /[\\/:*?"<>|]/.test(name)) {
    throw new Error('invalid folder name')
  }
  const parentReal = await resolveExistingDir(parent)
  const target = join(parentReal, name.trim())
  await mkdir(target)
  return target
}

async function openContaining(path) {
  const real = await realpath(path).catch(() => null)
  if (!real) throw new Error('path does not exist: ' + path)
  await execFileP('explorer.exe', ['/select,' + real], { timeout: 10000 }).catch(() => {
    /* best-effort reveal */
  })
  return real
}

/* ------------------------------------------------------------------ *
 * Router
 * ------------------------------------------------------------------ */

async function handleRoute(ctx, req, res, url) {
  const route = url.pathname.slice(BASE.length) || '/'

  if (req.method === 'GET' && route === '/workspaces') {
    return sendJson(res, 200, { ok: true, workspaces: workspaceList(ctx) })
  }
  if (req.method === 'GET' && route === '/browse') {
    const data = await browseDir(ctx, url.searchParams.get('path'))
    return sendJson(res, 200, { ok: true, ...data })
  }
  if (req.method === 'GET' && route === '/stat') {
    return sendJson(res, 200, { ok: true, file: await statFile(ctx, url.searchParams.get('path')) })
  }
  if (req.method === 'GET' && route === '/text') {
    const data = await readTextFile(ctx, url.searchParams.get('path'))
    return sendJson(res, 200, { ok: true, ...data })
  }
  if (req.method === 'GET' && route === '/bytes') {
    const p = url.searchParams.get('path')
    const buf = await readBytesFile(ctx, p)
    const ext = extname(p || '').slice(1).toLowerCase()
    return sendBytes(res, 200, buf, MIME[ext] || 'application/octet-stream')
  }
  if (req.method === 'GET' && route === '/render') {
    const pdf = await renderDocument(ctx, url.searchParams.get('path'))
    return sendBytes(res, 200, pdf, 'application/pdf')
  }
  if (req.method === 'GET' && route === '/dir-list') {
    const data = await browseAnyDir(url.searchParams.get('path'))
    return sendJson(res, 200, { ok: true, ...data })
  }
  if (req.method === 'GET' && route === '/deletions') {
    return sendJson(res, 200, { ok: true, items: await readDeletionLog() })
  }
  if (req.method === 'POST' && route === '/delete') {
    const body = await readJsonBody(req)
    const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string') : []
    if (!paths.length) throw new Error('no paths')
    const deleted = await deleteToRecycleBin(ctx, paths)
    return sendJson(res, 200, { ok: true, deleted })
  }
  if (req.method === 'POST' && route === '/move') {
    const body = await readJsonBody(req)
    const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string') : []
    if (!paths.length) throw new Error('no paths')
    if (typeof body.destDir !== 'string' || !body.destDir) throw new Error('no destination')
    const jobId = await enqueueTransfer(ctx, paths, body.destDir, 'move', body.conflict || 'rename')
    return sendJson(res, 200, { ok: true, jobId })
  }
  if (req.method === 'POST' && route === '/mkdir') {
    const body = await readJsonBody(req)
    const created = await makeDirectory(body.parent, body.name)
    return sendJson(res, 200, { ok: true, created })
  }
  if (req.method === 'POST' && route === '/open-containing') {
    const body = await readJsonBody(req)
    const revealed = await openContaining(body.path)
    return sendJson(res, 200, { ok: true, revealed })
  }
  if (req.method === 'POST' && route === '/copy') {
    const body = await readJsonBody(req)
    const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string') : []
    if (!paths.length) throw new Error('no paths')
    if (typeof body.destDir !== 'string' || !body.destDir) throw new Error('no destination')
    const jobId = await enqueueTransfer(ctx, paths, body.destDir, 'copy', body.conflict || 'rename')
    return sendJson(res, 200, { ok: true, jobId })
  }
  if (req.method === 'GET' && route === '/job') {
    const job = getJob(url.searchParams.get('id'))
    if (!job) return sendJson(res, 404, { ok: false, error: 'unknown job' })
    return sendJson(res, 200, { ok: true, job })
  }
  if (req.method === 'POST' && route === '/cancel-job') {
    const body = await readJsonBody(req)
    const job = getJob(body.jobId)
    if (job) job.abort.abort()
    return sendJson(res, 200, { ok: true })
  }
  if (req.method === 'POST' && route === '/rename') {
    const body = await readJsonBody(req)
    const renamed = await renamePath(ctx, body.path, body.newName)
    return sendJson(res, 200, { ok: true, renamed })
  }
  if (req.method === 'POST' && route === '/open-recycle-bin') {
    await openRecycleBin()
    return sendJson(res, 200, { ok: true })
  }
  if (req.method === 'GET' && route === '/operations') {
    return sendJson(res, 200, { ok: true, items: await readOperationLog() })
  }
  if (req.method === 'POST' && route === '/search-content') {
    const body = await readJsonBody(req)
    const r = await searchContent(ctx, body.root, body.query, body.caseSensitive)
    return sendJson(res, 200, { ok: true, ...r })
  }
  if (req.method === 'POST' && route === '/compress') {
    const body = await readJsonBody(req)
    const paths = Array.isArray(body.paths) ? body.paths.filter((p) => typeof p === 'string') : []
    if (!paths.length) throw new Error('no paths')
    if (typeof body.destDir !== 'string' || !body.destDir) throw new Error('no destination')
    const r = await compressPaths(ctx, paths, body.destDir, body.zipName, body.conflict || 'rename')
    return sendJson(res, 200, { ok: true, ...r })
  }
  if (req.method === 'POST' && route === '/extract') {
    const body = await readJsonBody(req)
    const r = await extractZip(ctx, body.path, body.destDir, body.conflict || 'rename')
    return sendJson(res, 200, { ok: true, ...r })
  }
  if (req.method === 'POST' && route === '/__client-error') {
    const body = await readJsonBody(req)
    const line = new Date().toISOString() + ' ' + JSON.stringify(body) + '\n'
    try {
      await mkdir(PLUGIN_DIR, { recursive: true })
      await writeFile(join(PLUGIN_DIR, 'client-error.log'), line, { flag: 'a' })
    } catch {
      /* best effort */
    }
    return sendJson(res, 200, { ok: true })
  }

  sendJson(res, 404, { ok: false, error: 'unknown route' })
}

export function apply(ctx) {
  // Never let a route-registration failure take the host boot down with it.
  try {
    ctx.effect(() => {
      try {
        const dispose = ctx.webServer.register({
          kind: 'prefix',
          path: BASE,
          handler: (req, res) => {
            let url
            try {
              url = new URL(req.url ?? '/', 'http://dsh.local')
            } catch {
              return sendJson(res, 400, { ok: false, error: 'bad request' })
            }
            handleRoute(ctx, req, res, url).catch((err) => {
              sendJson(res, 400, {
                ok: false,
                error: String(err?.message ?? err),
              })
            })
          },
        })
        return () => {
          if (typeof dispose === 'function') dispose()
        }
      } catch (err) {
        console.error('[dsh-file-archive] route registration failed:', err)
        return () => {}
      }
    }, 'dsh-file-archive: routes')
  } catch (err) {
    console.error('[dsh-file-archive] apply failed:', err)
  }
}
