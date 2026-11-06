#!/usr/bin/env node
// One change of the system, from its ticket here to its acceptance. It lives on the branch change/<n> of
// the ticket's number, here and in each repository it touches, and reaches main only when a person
// accepts the whole of it. One change goes at a time; the others wait in the queue. Where a change is,
// and what it has been through, is its state at the end of the ticket's text (pipeline/state.mjs).
// No AI runs here, except the agents `model` starts.
//
//   node pipeline/change.mjs start <n>             the open change, or a place in the queue (step= on GITHUB_OUTPUT)
//   node pipeline/change.mjs phase <n>             prints the phase, or none
//   node pipeline/change.mjs to <n> <phase> <why>  moves the change; asking counts a question to a person
//   node pipeline/change.mjs model <n>             the model agent on the branch, its answer, and the review
//                                                  (WAY=question when a coding agent asked)
//   node pipeline/change.mjs asks <n>              the model agent's questions besides a model change, to a person
//   node pipeline/change.mjs note <n> <from> <kind>  a coding agent's question (kind question) or why it stopped
//                                                  (kind stuck), from TEXT; prints the rounds of questions so far
//   node pipeline/change.mjs accept <n>            merges every pull request of the change: the model first
//   node pipeline/change.mjs next                  starts the oldest change in the queue
//   node pipeline/change.mjs runs <earlier> <next>   keeps the agent runs of a pull request's earlier text in the next
//
// GH_TOKEN speaks here as the workflow; AGENT_TOKEN merges and reads the other repositories.
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { fits } from './said.mjs'
import { ACTIVE, BrokenState, move, queueOf, ticketsOf, withQuestionOf } from './state.mjs'

export const ACCEPT = 'agent:accept'
/** A coding agent's question on the ticket. The standards' brief keeps notes of the pipeline
 *  (<!-- delegation ...), so the model agent reads it with the rest of the conversation. */
export const QUESTION = '<!-- delegation: question of a coding agent -->'
export const branchOf = (n) => `change/${n}`

/** What the model agent's run comes to: what it said, held to what it did. A coding agent's question
 *  is answered by a change of the model, as the model is all the coding agent reads: when the model agent
 *  changes nothing for it, a person reads the question. */
export function modelOutcome({ failed, said, changed, asked = false }) {
  if (failed || !fits(said, 'model-agent')) return 'could-not'
  if (said.result === 'modelled' && !changed) return 'could-not'
  if (said.result !== 'modelled' && changed) return said.result === 'question' ? 'question' : 'could-not'
  if (said.result === 'no-change' && asked) return 'question'
  return said.result
}

/** The brief the model agent reads after a review: the problems, to fix or to answer. */
export const reviewedBrief = (brief, problems) => `${brief.trimEnd()}

## Review of the model on this branch

Another agent read your change of the model against this ticket and found these problems. Fix each in
the model, or say in your report why it is not one.

${problems.map((p) => `- ${p}`).join('\n')}
`

/** What a pull request's text says under `## <heading>`. */
export function sectionOf(body, heading) {
  const at = (body ?? '').search(new RegExp(`^## ${heading}\\s*$`, 'm'))
  if (at < 0) return ''
  const rest = body.slice(at).split('\n').slice(1).join('\n')
  const end = rest.search(/^## /m)
  return (end < 0 ? rest : rest.slice(0, end)).trim()
}

/** A pull request's new text, with the agent runs of its earlier texts kept before this run's: each update
 *  replaces the text, and the cost of the change is all of them. */
export function withEarlierRuns(earlier, next) {
  const runs = sectionOf(earlier, 'Agent runs').split('\n').filter((l) => l.startsWith('- '))
  if (!runs.length) return next
  const at = next.search(/^## Agent runs\s*$/m)
  if (at < 0) return `${next.trimEnd()}\n\n## Agent runs\n\n${runs.join('\n')}\n`
  const head = next.slice(0, at)
  const rest = next.slice(at).split('\n').slice(1).join('\n')
  return `${head}## Agent runs\n\n${runs.join('\n')}\n${rest.replace(/^\n+/, '')}`
}

/** Whether every check of a pull request has passed; null while one still runs. */
export function checksOf(rollup) {
  const done = rollup.every((c) => (c.status ?? 'COMPLETED') === 'COMPLETED' && (c.state ?? 'X') !== 'PENDING')
  if (!done) return null
  return rollup.every((c) => ['SUCCESS', 'SKIPPED', 'NEUTRAL'].includes(c.conclusion ?? c.state))
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repo = process.env.GITHUB_REPOSITORY
  const [command, n, ...rest] = process.argv.slice(2)
  const gh = (token, ...args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 << 20, env: { ...process.env, GH_TOKEN: token ?? '' } }).trim()
  const here = (...args) => gh(process.env.GH_TOKEN, ...args)
  const agent = (...args) => gh(process.env.AGENT_TOKEN, ...args)
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
  const say = (lines) => appendFileSync(process.env.GITHUB_OUTPUT ?? '/dev/null', lines.map((l) => `${l}\n`).join(''))
  const comments = (number) => here('api', '--paginate', `repos/${repo}/issues/${number}/comments`, '--jq', '.[]').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  const repositories = () => JSON.parse(readFileSync('.radical/system.json', 'utf8')).repositories
    .map(({ name, repo: url }) => ({ name, slug: url.match(/github\.com\/(.+?)(\.git)?$/)[1] }))
  const tickets = repo && ticketsOf(repo)
  const to = (phase, why, extra = (s) => s) => tickets.write(n, (s) => extra(move(s, phase, why, tickets.now())))

  try {
    if (command === 'runs') {
      writeFileSync(rest[0], withEarlierRuns(readFileSync(n, 'utf8'), readFileSync(rest[0], 'utf8')))
    } else if (command === 'phase') {
      console.log(tickets.read(n)?.phase ?? 'none')
    } else if (command === 'to') {
      const [phase, why] = rest
      // A person's comment answers what was asked, or turns the change.
      const state = to(phase, why, (s) => (phase === 'asking' ? { ...s, personQuestions: s.personQuestions + 1 } : phase === 'modelling' && why.startsWith('a person') ? { ...s, openQuestions: false } : s))
      console.log(`#${n} is ${state.phase}: ${why}.`)
      say([`rounds=${state.personQuestions - (phase === 'asking' ? 1 : 0)}`])
    } else if (command === 'start') {
      const mine = tickets.read(n)
      const { active } = queueOf(tickets.open())
      if (mine && ACTIVE.has(mine.phase) && process.env.EVENT === 'workflow_dispatch') {
        // The loop starts the queue's next on each of its runs; a person who labels a ticket again means it.
        console.log(`#${n} has started already.`)
        say(['step=queued'])
      } else if (active && String(active) !== n) {
        if (!mine) tickets.write(n, (s) => s)
        here('issue', 'comment', n, '--repo', repo, '--body', `In the queue: the change of #${active} goes first. This one starts when that one is accepted or closed.`)
        console.log(`#${n} waits for #${active}.`)
        say(['step=queued'])
      } else {
        to('modelling', mine && mine.phase !== 'queued' ? 'labelled again' : 'started')
        console.log(`#${n} is the change now.`)
        say(['step=go'])
      }
    } else if (command === 'model') {
      // The brief: the ticket, and what people and the pipeline said on it (the standards' rules of trust).
      const { briefOf, mayWrite } = await import(join(process.cwd(), '.standards/pipeline/tools/questions.mjs'))
      const ticket = JSON.parse(here('issue', 'view', n, '--repo', repo, '--json', 'title,body'))
      const known = new Map()
      const trusted = (login) => {
        if (!known.has(login)) {
          let permission = 'none'
          try { permission = here('api', `repos/${repo}/collaborators/${login}/permission`, '--jq', '.permission') } catch {}
          known.set(login, mayWrite(permission))
        }
        return known.get(login)
      }
      // The state block is the pipeline's, not the ticket's words.
      const brief = briefOf(ticket.title, ticket.body.replace(/\n*<!-- radical-change[\s\S]*$/, ''), comments(n), trusted)
      writeFileSync('.agent/brief.md', brief)

      const changed = () => git('status', '--porcelain', '--', '.radical/model') !== ''
      const costs = []
      const run = (briefFile) => {
        const out = spawnSync('node', ['.standards/pipeline/tools/run-agent.mjs', 'model-agent', `brief=${briefFile}`, `source=issue-${n}`, '--report', '.agent/model-report.md'],
          { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'inherit'] })
        process.stdout.write(out.stdout ?? '')
        const ran = (out.stdout ?? '').split('\n').filter((l) => /^model-agent: .*\$\d/.test(l))
        costs.push(...ran)
        const runCost = ran.at(-1)?.match(/\$(\d+\.\d+)/)?.[1] ?? '0'
        const asked = spawnSync('node', ['pipeline/said.mjs', 'model-agent', '.agent/model-said.json', runCost], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
        process.stdout.write(asked.stdout ?? '')
        costs.push(...(asked.stdout ?? '').split('\n').filter((l) => /^model-agent-answer: \$\d/.test(l)))
        const answer = existsSync('.agent/model-said.json') ? JSON.parse(readFileSync('.agent/model-said.json', 'utf8')) : null
        return { result: modelOutcome({ failed: out.status !== 0, said: answer, changed: changed(), asked: process.env.WAY === 'question' }), said: answer }
      }

      let { result, said: answer } = run('.agent/brief.md')
      let review = null
      for (let round = 1; result === 'modelled' && round <= 2; round++) {
        spawnSync('node', ['pipeline/review.mjs', '.agent/brief.md', '.agent/review.json'], { stdio: 'inherit' })
        review = existsSync('.agent/review.json') ? JSON.parse(readFileSync('.agent/review.json', 'utf8')) : null
        costs.push(`model-review: $${(review?.cost ?? 0).toFixed(3)}`)
        if (!review || review.verdict === 'ok' || round === 2) break
        writeFileSync('.agent/brief-reviewed.md', reviewedBrief(brief, review.problems))
        ;({ result, said: answer } = run('.agent/brief-reviewed.md'))
      }

      const report = existsSync('.agent/model-report.md') ? readFileSync('.agent/model-report.md', 'utf8').trim() : ''
      const left = review?.verdict === 'problems' ? review.problems : []
      writeFileSync('.agent/model-pr.md', [report, '',
        '## Review', '', !review ? 'The review gave no answer.' : left.length ? `The review still finds, after the model agent's second try:\n\n${left.map((p) => `- ${p}`).join('\n')}` : 'The review found no problem.', '',
        '## Agent runs', '', ...costs.map((c) => `- ${c}`), ''].join('\n'))
      writeFileSync('.agent/questions.md', `## Questions\n\n${(answer?.questions ?? []).map((q, i) => `${i + 1}. ${q}`).join('\n') || answer?.why || 'The model agent gave no answer.'}\n`)
      // Questions the model agent asks while it goes on: a person sees them, and nobody waits.
      const alsoAsks = result === 'modelled' && (answer?.questions ?? []).length > 0
      tickets.write(n, (s) => ({ ...s, runs: [...s.runs, ...costs] }))
      console.log(`The model agent's run comes to: ${result}.`)
      say([`result=${result}`, `asks=${alsoAsks}`, `title=${ticket.title.replace(/[\r\n]+/g, ' ').slice(0, 200)}`])
    } else if (command === 'asks') {
      // The model agent modelled the change and asks besides: on the ticket, under the mark the standards'
      // brief keeps, so the next run reads the question and the answer together.
      const { MARKER } = await import(join(process.cwd(), '.standards/pipeline/tools/questions.mjs'))
      here('issue', 'comment', n, '--repo', repo, '--body', `${MARKER}\nThe model agent went on with the change, and asks a person too. Nobody waits for an answer; a comment here turns the change.\n\n${readFileSync('.agent/questions.md', 'utf8').replace(/^## Questions\s*/, '')}`)
      tickets.write(n, (s) => ({ ...s, openQuestions: true }))
    } else if (command === 'note') {
      const [from, kind] = rest
      const text = (process.env.TEXT ?? '').slice(0, 20000)
      if (kind === 'stuck') {
        here('issue', 'comment', n, '--repo', repo, '--body', `The coding agent of the ${from} stopped, and a person has to look:\n\n${text}`)
        to('stuck', `the ${from}'s coding agent stopped`)
        say(['rounds=0'])
      } else {
        here('issue', 'comment', n, '--repo', repo, '--body', `${QUESTION}\nThe coding agent of the ${from} asks about the model on the branch ${branchOf(n)}. Answer it by changing the model so that it says it; if the answer changes what the system does for a customer, ask a person instead.\n\n${text}`)
        const state = to('modelling', `the ${from}'s coding agent asks`, (s) => withQuestionOf(s, from))
        console.log(`Question ${state.agentQuestions[from]} of the ${from}'s coding agent on #${n}.`)
        say([`rounds=${state.agentQuestions[from]}`])
      }
    } else if (command === 'accept') {
      if (tickets.read(n)?.phase !== 'ready') {
        here('issue', 'comment', n, '--repo', repo, '--body', `Not merged: the change is not ready yet. Take the label ${ACCEPT} off, and put it on again once it is.`)
        process.exit(1)
      }
      const branch = branchOf(n)
      const pulls = [{ name: 'model', slug: repo }, ...repositories()].flatMap(({ name, slug }) =>
        JSON.parse(agent('pr', 'list', '--repo', slug, '--head', branch, '--state', 'open', '--json', 'number,url,isDraft,statusCheckRollup'))
          .map((p) => ({ ...p, name, slug })))
      const red = pulls.filter((p) => checksOf(p.statusCheckRollup ?? []) !== true)
      if (!pulls.length || red.length) {
        const why = !pulls.length ? 'it has no pull request open' : `these are not green: ${red.map((p) => p.url).join(', ')}`
        here('issue', 'comment', n, '--repo', repo, '--body', `Not merged: ${why}. Take the label ${ACCEPT} off, and put it on again once it is.`)
        process.exit(1)
      }
      to('accepting', 'a person accepts it')
      try {
        // The model first: a repository that has reached a commit of the model then always finds it on main.
        for (const pull of pulls) {
          if (pull.isDraft) agent('pr', 'ready', String(pull.number), '--repo', pull.slug)
          agent('pr', 'merge', String(pull.number), '--repo', pull.slug, '--merge', '--delete-branch')
          console.log(`Merged ${pull.url}.`)
        }
      } catch (error) {
        to('ready', 'a merge failed')
        here('issue', 'comment', n, '--repo', repo, '--body', `Not all merged: ${error.message.split('\n')[0]}. What is merged stays; take the label ${ACCEPT} off, and put it on again to merge the rest.`)
        process.exit(1)
      }
      to('accepted', 'merged')
      try { here('issue', 'edit', n, '--repo', repo, '--remove-label', ACCEPT) } catch {}
      here('issue', 'close', n, '--repo', repo, '--comment', `Accepted, and merged:\n\n${pulls.map((p) => `- ${p.name}: ${p.url}`).join('\n')}`)
    } else if (command === 'next') {
      const { active, next } = queueOf(tickets.open())
      if (active) {
        console.log(`#${active} is still open.`)
      } else {
        if (next) here('workflow', 'run', 'change.yml', '--repo', repo, '--ref', 'main', '-f', `ticket=${next}`)
        console.log(next ? `Starts #${next}.` : 'The queue is empty.')
      }
    } else {
      console.error('start, phase, to, model, asks, note, accept, next or runs?')
      process.exit(2)
    }
  } catch (error) {
    if (!(error instanceof BrokenState)) throw error
    here('issue', 'comment', n, '--repo', repo, '--body', error.message)
    console.error(error.message)
    process.exit(1)
  }
}
