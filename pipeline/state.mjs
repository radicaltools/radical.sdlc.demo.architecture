// The state of a change, in one place: a hidden block at the end of its ticket's text, which only the
// pipeline writes. The phases and the moves between them are below; the labels people see are drawn from
// the phase on every write, and the comments are the conversation, never read as state. A block that is
// not what the pipeline wrote stops the change rather than guess. No AI runs here.
import { execFileSync } from 'node:child_process'

/** Each phase, and the phases a change may move to from it. */
export const MOVES = {
  queued: ['modelling'],
  modelling: ['modelling', 'asking', 'building', 'stuck'],
  asking: ['modelling'],
  building: ['building', 'modelling', 'ready', 'stuck'],
  ready: ['ready', 'modelling', 'building', 'accepting', 'stuck'],
  accepting: ['accepted', 'ready'],
  stuck: ['modelling', 'building', 'ready'],
  accepted: [],
}
/** The phases of the open change: one at a time. */
export const ACTIVE = new Set(['modelling', 'asking', 'building', 'ready', 'accepting', 'stuck'])

/** The labels the pipeline draws from the phase; a person's labels (agent:implement, agent:accept) are commands. */
export const VIEW = { queued: 'change:queued', active: 'change:active', asking: 'agent:question', ready: 'change:ready', stuck: 'change:stuck' }

const OPEN = '<!-- radical-change'
const BLOCK = /\n*<!-- radical-change\n([\s\S]*?)\n-->\s*$/

export class BrokenState extends Error {}

export const newState = (at, extra = {}) => ({
  v: 1, phase: 'queued', tried: {}, agentQuestions: {}, personQuestions: 0, openQuestions: false, red: [], runs: [],
  history: [{ at, phase: 'queued', why: 'the ticket' }], ...extra,
})

/** The state in a ticket's text: null when it has none, BrokenState when it is not what the pipeline wrote. */
export function parseState(body) {
  const text = body ?? ''
  if (!text.includes(OPEN)) return null
  const match = text.match(BLOCK)
  let state
  try {
    state = match && JSON.parse(match[1])
  } catch {
    state = null
  }
  if (!state || state.v !== 1 || !MOVES[state.phase] || typeof state.tried !== 'object' || !Array.isArray(state.history)) {
    throw new BrokenState('The state at the end of this ticket\'s text is not what the pipeline wrote, so the change stops. Take the block out to start the change again from the queue.')
  }
  return state
}

/** The ticket's text with `state` as its block, the rest as it was. */
export function withState(body, state) {
  const rest = (body ?? '').replace(BLOCK, '').trimEnd()
  return `${rest}\n\n${OPEN}\n${JSON.stringify(state)}\n-->\n`
}

/** `state` moved to `phase`. A move the table does not have is a bug of the pipeline, and throws. */
export function move(state, phase, why, at) {
  if (!MOVES[state.phase].includes(phase)) throw new Error(`A change cannot go from ${state.phase} to ${phase} (${why}).`)
  return { ...state, phase, history: [...state.history, { at, phase, why }].slice(-50) }
}

/** How many times a repository's coding agent has asked about the change. A count from before it was kept
 *  per repository is for no repository. */
export const askedBy = (state, name) => (typeof state.agentQuestions === 'object' ? state.agentQuestions[name] ?? 0 : 0)
export const withQuestionOf = (state, name) => ({ ...state, agentQuestions: { ...(typeof state.agentQuestions === 'object' ? state.agentQuestions : {}), [name]: askedBy(state, name) + 1 } })

/** The labels to add and to take off for a state: its phase, and questions a person has not answered yet. */
export function labelsOf({ phase, openQuestions = false }) {
  const on = new Set([
    ...(phase === 'queued' ? [VIEW.queued] : []),
    ...(ACTIVE.has(phase) ? [VIEW.active] : []),
    ...(phase === 'asking' || (openQuestions && ACTIVE.has(phase)) ? [VIEW.asking] : []),
    ...(phase === 'ready' || phase === 'accepting' ? [VIEW.ready] : []),
    ...(phase === 'stuck' ? [VIEW.stuck] : []),
  ])
  return { add: [...on], remove: Object.values(VIEW).filter((l) => !on.has(l)) }
}

/** The change that is open, and the oldest waiting: from the tickets' states. */
export function queueOf(tickets) {
  const withPhase = tickets.filter((t) => t.state)
  return {
    active: withPhase.find((t) => ACTIVE.has(t.state.phase))?.number,
    next: withPhase.filter((t) => t.state.phase === 'queued').map((t) => t.number).sort((a, b) => a - b)[0],
  }
}

/** The tickets of `repo` as the workflow reads and writes them, with GH_TOKEN. */
export function ticketsOf(repo, now = () => new Date().toISOString()) {
  const gh = (...args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 << 20 }).trim()
  const view = (n) => JSON.parse(gh('issue', 'view', String(n), '--repo', repo, '--json', 'body,labels'))
  const bodyOf = (n) => view(n).body
  return {
    now,
    read: (n) => parseState(bodyOf(n)),
    /** Every open ticket with its state; a broken one counts as none. */
    open: () => JSON.parse(gh('issue', 'list', '--repo', repo, '--state', 'open', '--limit', '200', '--json', 'number,body')).map(({ number, body }) => {
      try { return { number, state: parseState(body) } } catch { return { number, state: null } }
    }),
    /** Reads the state just before writing, applies `change` to it (a new state when it has none), writes
     *  it, and puts the labels of its phase on the ticket. */
    write(n, change) {
      const { body, labels } = view(n)
      const state = change(parseState(body) ?? newState(now()))
      gh('issue', 'edit', String(n), '--repo', repo, '--body', withState(body, state))
      const has = new Set(labels.map((l) => l.name))
      const { add, remove } = labelsOf(state)
      const edits = [...add.filter((l) => !has.has(l)).flatMap((l) => ['--add-label', l]), ...remove.filter((l) => has.has(l)).flatMap((l) => ['--remove-label', l])]
      if (edits.length) {
        try { gh('issue', 'edit', String(n), '--repo', repo, ...edits) } catch (error) { console.error(error.message) }
      }
      return state
    },
  }
}
