import assert from 'node:assert/strict'
import { test } from 'node:test'
import { outcome } from '../reconcile-code.mjs'

test('code built with a question goes up as a draft', () => {
  assert.deepEqual(outcome({ changed: true, failed: false, questions: true, otherwise: 'ask' }), { act: 'pull', draft: true })
})

test('code with no question is an ordinary pull request', () => {
  assert.deepEqual(outcome({ changed: true, failed: false, questions: false, otherwise: 'pull' }), { act: 'pull', draft: false })
})

test('a run that failed, or built nothing, goes as the standards say', () => {
  assert.deepEqual(outcome({ changed: true, failed: true, questions: false, otherwise: 'ask' }), { act: 'ask', draft: false })
  assert.deepEqual(outcome({ changed: false, failed: false, questions: true, otherwise: 'ask' }), { act: 'ask', draft: false })
  assert.deepEqual(outcome({ changed: false, failed: false, questions: false, otherwise: 'pull' }), { act: 'pull', draft: false })
})

test('a run that says it needs no code goes up, however it wrote that', () => {
  for (const report of ['## No code needed\nOnly a text changed.', '**No code needed.** Only a text changed.', 'Read the changes.\n\nNo code needed: only a text changed.']) {
    assert.deepEqual(outcome({ report, changed: false, failed: false, questions: false, otherwise: 'ask' }), { act: 'pull', draft: false })
  }
})

test('saying no code is needed does not pass a failed run, a question or a sentence that says otherwise', () => {
  const report = '**No code needed.**'
  assert.deepEqual(outcome({ report, changed: false, failed: true, questions: false, otherwise: 'ask' }), { act: 'ask', draft: false })
  assert.deepEqual(outcome({ report, changed: false, failed: false, questions: true, otherwise: 'ask' }), { act: 'ask', draft: false })
  assert.deepEqual(outcome({ report: 'I could not tell whether no code needed changing.', changed: false, failed: false, questions: false, otherwise: 'ask' }), { act: 'ask', draft: false })
})
