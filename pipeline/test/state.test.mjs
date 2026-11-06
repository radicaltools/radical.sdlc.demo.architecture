import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ACTIVE, BrokenState, MOVES, labelsOf, move, newState, parseState, queueOf, withState } from '../state.mjs'

const at = '2026-11-06T10:00:00Z'

test('the state goes at the end of the text, the rest stays, and it reads back', () => {
  const state = newState(at)
  const body = withState('A customer wants to see when.\n', state)
  assert.match(body, /^A customer wants to see when\.\n\n<!-- radical-change\n\{.*\}\n-->\n$/s)
  assert.deepEqual(parseState(body), state)
  const again = withState(body, { ...state, phase: 'modelling' })
  assert.equal(again.match(/radical-change/g).length, 1)
  assert.equal(parseState(again).phase, 'modelling')
  assert.equal(parseState('A ticket with no state.'), null)
})

test('a block that is not what the pipeline wrote stops the change', () => {
  assert.throws(() => parseState('Text\n\n<!-- radical-change\n{ not json\n-->\n'), BrokenState)
  assert.throws(() => parseState('Text\n\n<!-- radical-change\n{"v":1,"phase":"flying","tried":{},"history":[]}\n-->\n'), BrokenState)
  assert.throws(() => parseState('Text <!-- radical-change and something after'), BrokenState)
})

test('a change moves only as the table says, and keeps what it went through', () => {
  let state = move(newState(at), 'modelling', 'started', at)
  state = move(state, 'building', 'modelled', at)
  state = move(state, 'ready', 'green', at)
  assert.deepEqual(state.history.map((h) => h.phase), ['queued', 'modelling', 'building', 'ready'])
  assert.throws(() => move(newState(at), 'ready', 'skipping', at), /cannot go from queued to ready/)
  assert.throws(() => move({ ...state, phase: 'accepted' }, 'modelling', 'after the end', at), /cannot go from accepted/)
  for (const [from, tos] of Object.entries(MOVES)) for (const to of tos) assert.ok(MOVES[to], `${from} → ${to}`)
})

test('the labels are drawn from the phase', () => {
  assert.deepEqual(labelsOf('queued').add, ['change:queued'])
  assert.deepEqual(labelsOf('asking').add.sort(), ['agent:question', 'change:active'])
  assert.deepEqual(labelsOf('ready').add.sort(), ['change:active', 'change:ready'])
  assert.deepEqual(labelsOf('accepted').add, [])
  assert.ok(labelsOf('accepted').remove.includes('change:active'))
  assert.ok(!labelsOf('stuck').remove.includes('change:stuck'))
})

test('one change is open at a time, and the oldest waiting goes next', () => {
  const t = (number, phase) => ({ number, state: phase && { ...newState(at), phase } })
  assert.deepEqual(queueOf([t(12, 'queued'), t(9, 'queued'), t(30, 'building'), t(5)]), { active: 30, next: 9 })
  assert.deepEqual(queueOf([t(12, 'queued'), t(9, 'accepted')]), { active: undefined, next: 12 })
  assert.ok(!ACTIVE.has('queued') && !ACTIVE.has('accepted'))
})
