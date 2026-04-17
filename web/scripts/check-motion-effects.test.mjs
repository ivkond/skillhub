import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const webRoot = path.resolve(import.meta.dirname, '..')
const scriptPath = path.resolve(import.meta.dirname, 'check-motion-effects.mjs')
const fixtureRoot = path.resolve(import.meta.dirname, '__fixtures__/check-motion')

function runCheck(scopePath) {
  return spawnSync(process.execPath, [scriptPath, '--scope', scopePath], {
    cwd: webRoot,
    encoding: 'utf8',
  })
}

test('known-good fixture passes motion checker', () => {
  const result = runCheck(path.resolve(fixtureRoot, 'known-good.tsx'))
  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /check:motion passed/i)
})

test('known-bad fixture fails motion checker', () => {
  const result = runCheck(path.resolve(fixtureRoot, 'known-bad.tsx'))
  assert.equal(result.status, 1, 'Expected known-bad fixture to fail')
  assert.match(result.stderr, /forbidden-infinite-motion/)
  assert.match(result.stderr, /transition-duration-range/)
  assert.match(result.stderr, /shadow-alpha-cap/)
  assert.match(result.stderr, /glow-alpha-cap/)
  assert.match(result.stderr, /blur-cap/)
})
