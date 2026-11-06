import assert from 'node:assert/strict'
import { test } from 'node:test'
import { sectionOf } from '../change.mjs'
import { costsIn, dependenciesOf, evidence, toStart, triedIn } from '../system.mjs'

const built = new Map([['warehouse', new Set(['stock', 'dispatch'])], ['shop', new Set(['orders', 'pricing'])]])
const needs = dependenciesOf([
  { relationType: 'interacts', sourceId: 'orders', targetId: 'dispatch' }, { relationType: 'interacts', sourceId: 'orders', targetId: 'pricing' },
  { relationType: 'interacts', sourceId: 'dispatch', targetId: 'carrier' }, { relationType: 'satisfies', sourceId: 'stock', targetId: 'orders' },
], built)

test('a repository depends on those whose elements it calls', () => {
  assert.deepEqual([...needs.get('shop')], ['warehouse'])
  assert.deepEqual([...needs.get('warehouse')], [])
})

test('the one called goes first, and the caller after it has reached the model', () => {
  const at = (warehouse, shop) => [{ name: 'warehouse', gap: warehouse }, { name: 'shop', gap: shop }]
  assert.deepEqual(toStart(at(2, 3), needs), ['warehouse'])
  assert.deepEqual(toStart(at(0, 3), needs), ['shop'])
  assert.deepEqual(toStart(at(2, 0), needs), ['warehouse'])
  assert.deepEqual(toStart(at(0, 0), needs), [])
})

test('repositories that call each other all start', () => {
  const both = new Map([['a', new Set(['b'])], ['b', new Set(['a'])]])
  assert.deepEqual(toStart([{ name: 'a', gap: 1 }, { name: 'b', gap: 1 }], both), ['a', 'b'])
})

test('each repository gets one try for each commit of the model, as the state records', () => {
  const state = { tried: { shop: ['abc'] } }
  assert.equal(triedIn(state, 'shop', 'abc'), true)
  assert.equal(triedIn(state, 'shop', 'def'), false)
  assert.equal(triedIn(state, 'warehouse', 'abc'), false)
})

test('what a pull request says under a heading, and the costs in it', () => {
  const body = 'Built it.\n\n## Proof\n\n| a | b |\n\n## Agent runs\n\n- coding-agent: claude-haiku-5-5, 9 turns, 100 input and 20 output tokens, $0.012\n\nPart of x#1'
  assert.equal(sectionOf(body, 'Proof'), '| a | b |')
  assert.equal(sectionOf(body, 'Nothing'), '')
  assert.deepEqual(costsIn([body, undefined, '- model-review: $0.004\n- not a cost']), ['coding-agent: claude-haiku-5-5, 9 turns, 100 input and 20 output tokens, $0.012', 'model-review: $0.004'])
})

test('the evidence holds the model, each pull request with its proof, and the cost', () => {
  const text = evidence({
    n: 7, desired: 'abc', modelPull: { url: 'https://x/pull/8', body: '- model-agent: haiku, $0.020' }, modelDiff: 'Elements: 1 added',
    pulls: [{ name: 'shop', url: 'https://s/pull/2', body: '## Proof\n\n| Paid | t | fails on main, passes here |\n\n## Agent runs\n\n- coding-agent: haiku, $0.030' }],
  })
  assert.match(text, /^## Ready to accept/)
  assert.match(text, /agent:accept/)
  assert.match(text, /https:\/\/x\/pull\/8/)
  assert.match(text, /\*\*shop\*\*: https:\/\/s\/pull\/2\n\n\| Paid \| t \| fails on main, passes here \|/)
  assert.match(text, /About \$0\.05 in all/)
  assert.match(evidence({ n: 7, desired: 'abc', pulls: [] }), /Unchanged: this change only brings the code to the model/)
})
