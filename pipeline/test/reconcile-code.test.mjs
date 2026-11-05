import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileProof, outcome, proofText, scenariosToProve, testsIn } from '../reconcile-code.mjs'

const said = (result, questions = []) => ({ result, why: 'Because.', questions })
const none = { push: false, mark: false, ask: false }

test('built code goes up and reaches the model', () => {
  assert.deepEqual(outcome({ said: said('built'), changed: true, failed: false }), { push: true, mark: true, ask: false })
})

test('a run that needs no code reaches the model with nothing else', () => {
  assert.deepEqual(outcome({ said: said('no-code'), changed: false, failed: false }), { push: true, mark: true, ask: false })
})

test('a question goes to the model agent, with the code so far, and the model is not reached', () => {
  assert.deepEqual(outcome({ said: said('question', ['Which date?']), changed: true, failed: false }), { push: true, mark: false, ask: true })
  assert.deepEqual(outcome({ said: said('question'), changed: false, failed: false }), { push: false, mark: false, ask: true })
  assert.deepEqual(outcome({ said: said('built', ['Is null right?']), changed: true, failed: false }), { push: true, mark: false, ask: true })
})

test('a person reads a run that failed, could not finish, said nothing in the shape, or says one thing and did another', () => {
  assert.deepEqual(outcome({ said: said('built'), changed: true, failed: true }), none)
  assert.deepEqual(outcome({ said: said('could-not'), changed: true, failed: false }), none)
  assert.deepEqual(outcome({ said: null, changed: true, failed: false }), none)
  assert.deepEqual(outcome({ said: { result: 'done', why: '', questions: [] }, changed: true, failed: false }), none)
  assert.deepEqual(outcome({ said: said('built'), changed: false, failed: false }), none)
})

test('the scenarios to prove are those of the part that changed, with their tests', () => {
  const report = { elements: { added: [{ id: 's1', type: 'scenario', label: 'New' }], changed: [{ id: 's2', label: 'Changed' }, { id: 'r1', type: 'requirement', label: 'Req' }, { id: 's3', type: 'scenario', label: 'Elsewhere' }], removed: [{ id: 's4', type: 'scenario', label: 'Gone' }] } }
  const nodes = [{ id: 's2', type: 'scenario' }]
  const verifies = [{ element: 's1', tests: ['a.test.ts › new'] }]
  assert.deepEqual(scenariosToProve(report, new Set(['s1', 's2', 'r1']), nodes, verifies), [
    { id: 's1', label: 'New', tests: ['a.test.ts › new'] },
    { id: 's2', label: 'Changed', tests: [] },
  ])
})

test('the proof says of each test whether it fails on main and passes here', () => {
  assert.equal(proofText([]), 'No scenario of this part changed.')
  const text = proofText([{ label: 'New', test: 'a › b', state: 'proven' }, { label: 'Old', test: 'c › d', state: 'not proven', why: 'passes | without the fix' }, { label: 'Bare', state: 'none' }])
  assert.match(text, /\| New \| `a › b` \| fails on main, passes here \|/)
  assert.match(text, /\| Old \| `c › d` \| not proven: passes \| without the fix \|/)
  assert.match(text, /\| Bare \|  \| no test bound \|/)
})

test('a test bound by its name is itself; a whole file is each test vitest lists in it', () => {
  assert.deepEqual(testsIn('a.test.ts › d › n', []), ['a.test.ts › d › n'])
  assert.deepEqual(testsIn('o.test.ts', [{ name: 'openapi > describes GET' }, { name: 'top level' }]), ['o.test.ts › openapi › describes GET', 'o.test.ts › top level'])
})

test('a whole file proves its scenario when one of its tests fails on main and passes here', () => {
  assert.deepEqual(fileProof('o.test.ts', [{ proven: false }, { proven: true }]), { test: 'o.test.ts', state: 'proven', why: '1 of 2 of its tests fail on main and pass here' })
  assert.equal(fileProof('o.test.ts', [{ proven: false }]).state, 'not proven')
  assert.equal(fileProof('o.test.ts', []).state, 'not proven')
})
