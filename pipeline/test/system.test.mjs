import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dependenciesOf, ticketsIn, toStart } from '../system.mjs'

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

test('the tickets are those the model agent names at the end of its commits', () => {
  assert.deepEqual(ticketsIn(['Model: Where is my order (#27)', 'Model: Fix F-0001', 'Model: again (#27)', 'Model: Other (#3)', '']), ['27', '3'])
})
