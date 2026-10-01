/**
 * Smoke tests — run with `node test/smoke.mjs`.
 * Covers the safety guards and the zero-dependency ZIP implementation.
 */
import { isDeniedRoot, assertWithinWorkspace } from '../guards.js'
import { createZip, extractZip } from '../zip.js'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

let failed = 0
function ok(name, cond) {
  console.log((cond ? '  ok    ' : '  FAIL  ') + name)
  if (!cond) failed++
}

/* ---- guards ---- */
ok('denylist blocks C:\\Windows', isDeniedRoot('C:\\Windows') === true)
ok('denylist blocks C:\\Program Files', isDeniedRoot('C:\\Program Files') === true)
ok('denylist allows a neutral path', isDeniedRoot('/tmp/dfa-nope') === false)

let threw = false
try {
  await assertWithinWorkspace('/definitely/not/here', ['/tmp'])
} catch {
  threw = true
}
ok('allowlist rejects a path that does not exist', threw)

/* ---- zip ---- */
const dir = await mkdtemp(join(tmpdir(), 'dfa-test-'))
try {
  await writeFile(join(dir, 'a.txt'), 'hello world '.repeat(200))
  await createZip([join(dir, 'a.txt')], join(dir, 'o.zip'))
  await extractZip(join(dir, 'o.zip'), join(dir, 'out'))
  const text = await readFile(join(dir, 'out', 'a.txt'), 'utf8')
  ok('zip round-trip preserves content', text === 'hello world '.repeat(200))
} finally {
  await rm(dir, { recursive: true, force: true })
}

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
