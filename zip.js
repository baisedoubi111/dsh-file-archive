/**
 * dsh-file-archive · zero-dependency ZIP reader/writer
 *
 * Uses only node:zlib + node:fs. No npm packages, so a `link:`-installed
 * plugin can never fail to resolve a transitive dependency at boot.
 *
 * Extraction validates every entry path against the destination root
 * (zip-slip guard).
 */
import { mkdir, readFile, readdir, lstat } from 'node:fs/promises'
import { writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { deflateRawSync, inflateRawSync } from 'node:zlib'

const SIG_LOCAL = 0x04034b50
const SIG_CENTRAL = 0x02014b50
const SIG_EOCD = 0x06054b50

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function dosDateTime(d) {
  const time = ((d.getHours() & 0x1f) << 11) | ((d.getMinutes() & 0x3f) << 5) | ((Math.floor(d.getSeconds() / 2)) & 0x1f)
  const date = (((d.getFullYear() - 1980) & 0x7f) << 9) | (((d.getMonth() + 1) & 0x0f) << 5) | (d.getDate() & 0x1f)
  return { time, date }
}

/** Collect files (relative zip name + absolute source path) under each source. */
async function collectFiles(srcPaths) {
  const out = []
  for (const p of srcPaths) {
    const st = await lstat(p)
    if (st.isFile()) {
      out.push({ name: basename(p), srcPath: p })
    } else if (st.isDirectory()) {
      const base = basename(p)
      async function walk(dir, rel) {
        const dirents = await readdir(dir, { withFileTypes: true })
        for (const d of dirents) {
          const full = join(dir, d.name)
          const r = rel ? rel + '/' + d.name : d.name
          if (d.isDirectory()) await walk(full, r)
          else if (d.isFile()) out.push({ name: r, srcPath: full })
        }
      }
      await walk(p, base)
    }
  }
  return out
}

/**
 * Create a zip at `destZip` containing every source path.
 * @returns {{entries:number, bytes:number}}
 */
export async function createZip(srcPaths, destZip) {
  const files = await collectFiles(srcPaths)
  const body = []
  const central = []
  let offset = 0
  for (const f of files) {
    const data = await readFile(f.srcPath)
    const crc = crc32(data)
    const deflated = deflateRawSync(data)
    const useDeflate = deflated.length < data.length
    const method = useDeflate ? 8 : 0
    const payload = useDeflate ? deflated : data
    const nameBuf = Buffer.from(f.name, 'utf8')
    const { time, date } = dosDateTime(new Date())

    const local = Buffer.alloc(30)
    local.writeUInt32LE(SIG_LOCAL, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(0x0800, 6) // UTF-8 names
    local.writeUInt16LE(method, 8)
    local.writeUInt16LE(time, 10)
    local.writeUInt16LE(date, 12)
    local.writeUInt32LE(crc, 14)
    local.writeUInt32LE(payload.length, 18)
    local.writeUInt32LE(data.length, 22)
    local.writeUInt16LE(nameBuf.length, 26)
    local.writeUInt16LE(0, 28)
    body.push(local, nameBuf, payload)

    central.push({ nameBuf, method, time, date, crc, compSize: payload.length, uncompSize: data.length, offset })
    offset += 30 + nameBuf.length + payload.length
  }

  const cdParts = []
  let cdSize = 0
  for (const c of central) {
    const e = Buffer.alloc(46)
    e.writeUInt32LE(SIG_CENTRAL, 0)
    e.writeUInt16LE(20, 4)
    e.writeUInt16LE(20, 6)
    e.writeUInt16LE(0x0800, 8)
    e.writeUInt16LE(c.method, 10)
    e.writeUInt16LE(c.time, 12)
    e.writeUInt16LE(c.date, 14)
    e.writeUInt32LE(c.crc, 16)
    e.writeUInt32LE(c.compSize, 20)
    e.writeUInt32LE(c.uncompSize, 24)
    e.writeUInt16LE(c.nameBuf.length, 28)
    e.writeUInt16LE(0, 30)
    e.writeUInt16LE(0, 32)
    e.writeUInt16LE(0, 34)
    e.writeUInt16LE(0, 36)
    e.writeUInt32LE(0, 38)
    e.writeUInt32LE(c.offset, 42)
    cdParts.push(e, c.nameBuf)
    cdSize += 46 + c.nameBuf.length
  }

  const eocd = Buffer.alloc(22)
  eocd.writeUInt32LE(SIG_EOCD, 0)
  eocd.writeUInt16LE(0, 4)
  eocd.writeUInt16LE(0, 6)
  eocd.writeUInt16LE(central.length, 8)
  eocd.writeUInt16LE(central.length, 10)
  eocd.writeUInt32LE(cdSize, 12)
  eocd.writeUInt32LE(offset, 16)
  eocd.writeUInt16LE(0, 20)

  const out = Buffer.concat([...body, ...cdParts, eocd])
  await writeFile(destZip, out)
  return { entries: central.length, bytes: out.length }
}

/**
 * Extract `zipPath` into `destDir`. Every entry is confined to `destDir`.
 * @returns {{entries:number}}
 */
export async function extractZip(zipPath, destDir) {
  const buf = await readFile(zipPath)
  let eocd = -1
  const minStart = Math.max(0, buf.length - 22 - 65535)
  for (let i = buf.length - 22; i >= minStart; i--) {
    if (buf.readUInt32LE(i) === SIG_EOCD) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('not a zip file (EOCD not found)')

  const total = buf.readUInt16LE(eocd + 10)
  const cdOffset = buf.readUInt32LE(eocd + 16)
  const base = resolve(destDir)
  let p = cdOffset
  let entries = 0

  for (let n = 0; n < total; n++) {
    if (buf.readUInt32LE(p) !== SIG_CENTRAL) throw new Error('corrupt central directory')
    const method = buf.readUInt16LE(p + 10)
    const compSize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const localOffset = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)
    p += 46 + nameLen + extraLen + commentLen

    // zip-slip guard
    const target = resolve(base, name)
    if (target !== base && !target.startsWith(base + sep)) {
      throw new Error('unsafe path in zip: ' + name)
    }

    if (name.endsWith('/')) {
      await mkdir(target, { recursive: true })
      continue
    }
    if (buf.readUInt32LE(localOffset) !== SIG_LOCAL) throw new Error('corrupt local header')
    const lNameLen = buf.readUInt16LE(localOffset + 26)
    const lExtraLen = buf.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + lNameLen + lExtraLen
    const comp = buf.subarray(dataStart, dataStart + compSize)
    const data = method === 8 ? inflateRawSync(comp) : Buffer.from(comp)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, data)
    entries++
  }
  return { entries }
}
