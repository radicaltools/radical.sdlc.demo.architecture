import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { gapIn, partOf, readNodes, writePart } from '../part.mjs'

const NODES = [
  { id: 'shop', type: 'system' }, { id: 'orders', type: 'container', parentId: 'shop' }, { id: 'book', type: 'component', parentId: 'orders' },
  { id: 'wh', type: 'system' }, { id: 'stock', type: 'container', parentId: 'wh' },
  { id: 'need', type: 'need' }, { id: 'req', type: 'requirement' }, { id: 'scen', type: 'scenario' },
  { id: 'otherReq', type: 'requirement' }, { id: 'adr', type: 'adr' }, { id: 'ff', type: 'fitness-fn' },
]
const RELATIONS = [
  { relationType: 'satisfies', sourceId: 'book', targetId: 'req' }, { relationType: 'derives', sourceId: 'req', targetId: 'need' },
  { relationType: 'verifies', sourceId: 'scen', targetId: 'req' }, { relationType: 'constrains', sourceId: 'adr', targetId: 'orders' },
  { relationType: 'implements', sourceId: 'ff', targetId: 'adr' }, { relationType: 'satisfies', sourceId: 'stock', targetId: 'otherReq' },
]

test('the part is what the repository maps and all that hangs on it', () => {
  const { built, here, keep } = partOf(NODES, RELATIONS, new Set(['orders']))
  assert.deepEqual([...built].sort(), ['book', 'orders'])
  assert.deepEqual([...here].sort(), ['adr', 'book', 'ff', 'need', 'orders', 'req', 'scen'])
  assert.ok(keep.has('shop'), 'an ancestor stays, for the tree to hold')
  assert.ok(!here.has('shop') && !keep.has('stock') && !keep.has('otherReq'))
})

test('the part holds the state machines its components implement, with their states and scenarios', () => {
  const nodes = [...NODES, { id: 'order', type: 'entity' }, { id: 'life', type: 'state-machine' }, { id: 'paid', type: 'state', parentId: 'life' }, { id: 'lifeScen', type: 'scenario' },
    { id: 'stockLife', type: 'state-machine' }, { id: 'held', type: 'state', parentId: 'stockLife' },
    { id: 'parcel', type: 'entity' }, { id: 'parcelLife', type: 'state-machine' }]
  const relations = [...RELATIONS, { relationType: 'realises', sourceId: 'book', targetId: 'order' }, { relationType: 'implements', sourceId: 'book', targetId: 'life' },
    { relationType: 'verifies', sourceId: 'lifeScen', targetId: 'life' }, { relationType: 'implements', sourceId: 'stock', targetId: 'stockLife' },
    { relationType: 'implements', sourceId: 'book', targetId: 'parcelLife' }, { relationType: 'lifecycle-of', sourceId: 'parcelLife', targetId: 'parcel' }]
  const { here } = partOf(nodes, relations, new Set(['orders']))
  for (const id of ['order', 'life', 'paid', 'lifeScen', 'parcelLife', 'parcel']) assert.ok(here.has(id), id)
  for (const id of ['stockLife', 'held']) assert.ok(!here.has(id), id)
})

test('a gap counts only changes of the part', () => {
  const report = {
    elements: { added: [{ id: 'req' }, { id: 'otherReq' }], changed: [{ id: 'book' }], removed: [{ id: 'gone' }] },
    relations: { added: [{ source: { id: 'book' }, target: { id: 'x' } }, { source: { id: 'stock' }, target: { id: 'otherReq' } }], changed: [], removed: [] },
  }
  assert.equal(gapIn(report, new Set(['req', 'book'])), 3)
  assert.equal(gapIn(report, new Set(['gone'])), 1)
  assert.equal(gapIn(report, new Set()), 0)
})

test('a part on disk keeps the tree, drops the rest, and keeps relations to other models', () => {
  const whole = mkdtempSync(join(tmpdir(), 'whole-'))
  const out = join(mkdtempSync(join(tmpdir(), 'out-')), 'part')
  const file = (path, id, type) => { const p = join(whole, 'nodes', path); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, `---\nid: "${id}"\ntype: "${type}"\n---\n\nid: not-this\n`) }
  file('shop/_index.md', 'shop', 'system'); file('shop/orders/_index.md', 'orders', 'container'); file('wh/_index.md', 'wh', 'system'); file('req.md', 'req', 'requirement'); file('other.md', 'other', 'requirement')
  writeFileSync(join(whole, 'relations.json'), JSON.stringify([
    { relationType: 'satisfies', sourceId: 'orders', targetId: 'req' }, { relationType: 'satisfies', sourceId: 'wh', targetId: 'other' }, { relationType: 'constrains', sourceId: 'from-standards', targetId: 'orders' },
  ]))
  writeFileSync(join(whole, 'metamodel.json'), '{}'); writeFileSync(join(whole, 'views.json'), '[{"id":"v"}]')
  assert.deepEqual(readNodes(whole).find((n) => n.id === 'orders').parentId, 'shop')
  assert.deepEqual(writePart(whole, out, new Set(['orders'])), { kept: 3, of: 5 })
  assert.ok(existsSync(join(out, 'nodes/shop/_index.md')) && existsSync(join(out, 'nodes/req.md')) && existsSync(join(out, 'metamodel.json')))
  assert.ok(!existsSync(join(out, 'nodes/wh/_index.md')) && !existsSync(join(out, 'nodes/other.md')))
  assert.equal(readFileSync(join(out, 'views.json'), 'utf8').trim(), '[]')
  assert.deepEqual(JSON.parse(readFileSync(join(out, 'relations.json'), 'utf8')).map((r) => r.sourceId), ['orders', 'from-standards'])
})
