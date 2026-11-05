import assert from 'node:assert/strict'
import { test } from 'node:test'
import { askOf, fits, saidIn, schemaOf } from '../said.mjs'
import { reviewIn } from '../review.mjs'

const answer = (structured) => JSON.stringify({ result: 'text', structured_output: structured })

test('each agent has its own answers, and the question names them all', () => {
  assert.deepEqual(schemaOf('coding-agent').properties.result.enum, ['built', 'no-code', 'question', 'could-not'])
  assert.deepEqual(schemaOf('model-agent').properties.result.enum, ['modelled', 'no-change', 'question', 'could-not'])
  for (const result of ['modelled', 'no-change', 'question', 'could-not']) assert.match(askOf('model-agent'), new RegExp(`"${result}"`))
})

test('only an answer in the shape asked counts, and only one of that agent', () => {
  assert.deepEqual(saidIn(answer({ result: 'no-code', why: 'x', questions: [] }), 'coding-agent'), { result: 'no-code', why: 'x', questions: [] })
  assert.equal(saidIn(answer({ result: 'modelled', why: 'x', questions: [] }), 'coding-agent'), null)
  assert.equal(saidIn(answer({ result: 'built', why: 'x' }), 'coding-agent'), null)
  assert.equal(saidIn(answer({ result: 'built', why: 'x', questions: [1] }), 'coding-agent'), null)
  assert.equal(saidIn(JSON.stringify({ result: '{"result":"built"}' }), 'coding-agent'), null)
  assert.equal(saidIn('Execution error', 'coding-agent'), null)
  assert.equal(fits(null, 'coding-agent'), false)
})

test('a review is ok with no problem, or names its problems', () => {
  assert.deepEqual(reviewIn(answer({ verdict: 'ok', problems: ['ignored'] })), { verdict: 'ok', problems: [] })
  assert.deepEqual(reviewIn(answer({ verdict: 'problems', problems: ['Shop left out'] })), { verdict: 'problems', problems: ['Shop left out'] })
  assert.equal(reviewIn(answer({ verdict: 'fine', problems: [] })), null)
  assert.equal(reviewIn('nothing'), null)
})
