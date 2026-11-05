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
