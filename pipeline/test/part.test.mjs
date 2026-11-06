import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { builtBy, countOf, readNodes } from '../part.mjs'

test('a repository builds what it maps and all under it', () => {
  const nodes = [{ id: 'shop', type: 'system' }, { id: 'orders', type: 'container', parentId: 'shop' }, { id: 'book', type: 'component', parentId: 'orders' }, { id: 'stock', type: 'container' }]
  assert.deepEqual([...builtBy(nodes, new Set(['orders']))].sort(), ['book', 'orders'])
})

test('a gap counts every change of the report', () => {
  const report = {
    elements: { added: [{ id: 'req' }], changed: [{ id: 'book' }], removed: [{ id: 'gone' }] },
    relations: { added: [{ source: { id: 'book' }, target: { id: 'x' } }], changed: [], removed: [] },
  }
  assert.equal(countOf(report), 4)
  assert.equal(countOf({ elements: { added: [], changed: [], removed: [] }, relations: { added: [], changed: [], removed: [] } }), 0)
})

test("a node's parent is the _index.md of the folder it is in", () => {
  const whole = mkdtempSync(join(tmpdir(), 'whole-'))
  const file = (path, id, type) => { const p = join(whole, 'nodes', path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, `---\nid: "${id}"\ntype: "${type}"\n---\n\nid: not-this\n`) }
  file('shop/_index.md', 'shop', 'system'); file('shop/orders/_index.md', 'orders', 'container'); file('shop/orders/book.md', 'book', 'component')
  const nodes = readNodes(whole)
  assert.equal(nodes.find((n) => n.id === 'orders').parentId, 'shop')
  assert.equal(nodes.find((n) => n.id === 'book').parentId, 'orders')
  assert.equal(nodes.find((n) => n.id === 'shop').parentId, undefined)
})
