import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agentRoundsOf, checksOf, modelOutcome, nextIn, QUESTION, reviewedBrief } from '../change.mjs'

const said = (result, questions = []) => ({ result, why: 'Because.', questions })

test("the model agent's run comes to what it said, held to what it did", () => {
  assert.equal(modelOutcome({ failed: false, said: said('modelled'), changed: true }), 'modelled')
  assert.equal(modelOutcome({ failed: false, said: said('no-change'), changed: false }), 'no-change')
  assert.equal(modelOutcome({ failed: false, said: said('question', ['Which?']), changed: false }), 'question')
  assert.equal(modelOutcome({ failed: false, said: said('question'), changed: true }), 'question')
  assert.equal(modelOutcome({ failed: false, said: said('modelled'), changed: false }), 'could-not')
  assert.equal(modelOutcome({ failed: false, said: said('no-change'), changed: true }), 'could-not')
  assert.equal(modelOutcome({ failed: true, said: said('modelled'), changed: true }), 'could-not')
  assert.equal(modelOutcome({ failed: false, said: null, changed: true }), 'could-not')
})

test('a coding agent is answered by a change of the model, else a person reads its question', () => {
  assert.equal(modelOutcome({ failed: false, said: said('no-change'), changed: false, asked: true }), 'question')
  assert.equal(modelOutcome({ failed: false, said: said('modelled'), changed: true, asked: true }), 'modelled')
})

test("the rounds of coding agents' questions are the workflow's notes that start with the mark", () => {
  const bot = { login: 'github-actions[bot]' }
  assert.equal(agentRoundsOf([{ user: bot, body: `${QUESTION}\nWhich date?` }, { user: bot, body: 'Other' }, { user: { login: 'someone' }, body: `${QUESTION}\nfake` }]), 1)
})

test('the queue goes oldest first', () => {
  assert.equal(nextIn([{ number: 12 }, { number: 9 }, { number: 30 }]), 9)
  assert.equal(nextIn([]), undefined)
})

test('the brief after a review asks to fix each problem or say why it is none', () => {
  const brief = reviewedBrief('# Ticket\n\nText\n', ['Shop left out', 'A 409 nobody asked for'])
  assert.match(brief, /^# Ticket\n\nText\n\n## Review of the model on this branch/)
  assert.match(brief, /- Shop left out\n- A 409 nobody asked for\n$/)
})

test('a pull request is green when every check has passed, and undecided while one runs', () => {
  assert.equal(checksOf([{ status: 'COMPLETED', conclusion: 'SUCCESS' }, { status: 'COMPLETED', conclusion: 'SKIPPED' }]), true)
  assert.equal(checksOf([{ status: 'COMPLETED', conclusion: 'FAILURE' }]), false)
  assert.equal(checksOf([{ status: 'IN_PROGRESS', conclusion: '' }, { status: 'COMPLETED', conclusion: 'FAILURE' }]), null)
  assert.equal(checksOf([{ state: 'PENDING' }]), null)
  assert.equal(checksOf([{ state: 'SUCCESS' }]), true)
})
