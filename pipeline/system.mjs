#!/usr/bin/env node
// The loop of the whole system: it brings the code of each repository to a commit of the model, and each
// repository's .radical/reconciled.json says which commit its code has reached.
//
// While a change is open (the ticket with change:active), that commit is the tip of its branch change/<n>.
// For each repository this reads what of its part is not built on its own change/<n> yet, and starts the
// repositories whose work can go now: one that calls another (`interacts` in the model) goes after it,
// and each once for each commit of the model. When none has anything left, it runs each code gate once
// more, as a gate that ran before the other side had its branch tested that side's main, and when every
// pull request of the change is green, it puts what a person needs to accept the change on the ticket.
//
// With no change open, the commit is main's, and main has to be built already: a repository that has not
// reached it gets a ticket in the queue. Then the oldest change in the queue starts.
//
// It runs when a branch moves, when a repository has pushed, on a push of the model to main, and every
// day, so a lost event loses nothing. No AI runs here.
//
//   node pipeline/system.mjs     with GH_TOKEN (this repository), AGENT_TOKEN (the other repositories)
import { execFileSync } from 'node:child_process'
import { appendFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { branchOf, checksOf, LABELS, nextIn, sectionOf } from './change.mjs'
import { builtBy, gapOf, mappedBy, readNodes, readRelations } from './part.mjs'

const MODEL = '.radical/model'

/** For each repository, those it calls. `built` maps a repository's name to the elements it builds. */
export function dependenciesOf(relations, built) {
  const owner = (id) => [...built].find(([, ids]) => ids.has(id))?.[0]
  const needs = new Map([...built.keys()].map((name) => [name, new Set()]))
  for (const { relationType, sourceId, targetId } of relations) {
    const [from, to] = [owner(sourceId), owner(targetId)]
    if (relationType === 'interacts' && from && to && from !== to) needs.get(from).add(to)
  }
  return needs
}

/** Who starts now: those with a gap whose dependencies have none. If they wait for each other, all of them. */
export function toStart(repositories, needs) {
  const open = repositories.filter((r) => r.gap > 0)
  const free = open.filter((r) => ![...needs.get(r.name)].some((n) => open.some((o) => o.name === n)))
  return (free.length ? free : open).map((r) => r.name)
}

/** The mark a start leaves on the ticket: each repository gets one try for each commit of the model. */
export const startMark = (name, desired) => `<!-- started ${name} ${desired} -->`
export const triedIn = (comments, name, desired) => comments.some((c) => c.body?.startsWith(startMark(name, desired)))
/** The mark of the gates run again once every repository has built a commit of the model. */
export const rerunMark = (desired) => `<!-- gates again ${desired} -->`

/** The cost lines the agents' runs left in the texts of a change's pull requests. */
export const costsIn = (texts) => texts.flatMap((t) => (t ?? '').split('\n').filter((l) => /^- [\w-]+: .*\$\d+\.\d{3}/.test(l)).map((l) => l.slice(2)))

/** What a person reads to accept a change: what changed in the model, each pull request, the proof of its
 *  tests, and what the agents cost. */
export function evidence({ n, desired, modelPull, modelDiff, pulls }) {
  const costs = costsIn([modelPull?.body, ...pulls.map((p) => p.body)])
  const total = costs.reduce((sum, l) => sum + Number(l.match(/\$(\d+\.\d+)/)[1]), 0)
  return [
    `<!-- change: ready ${desired} -->`,
    `## Ready to accept`,
    '',
    `The change is built in every repository it touches, on the branches \`${branchOf(n)}\`, and every gate is green, the test of the systems together among them. Give this ticket the label \`${LABELS.accept}\` to merge all of it: the model first, then the code. A comment here instead sends it back to the model agent.`,
    '',
    '### The model',
    '',
    modelPull ? `${modelPull.url}` : 'Unchanged: this change only brings the code to the model.',
    ...(modelDiff ? ['', '```', modelDiff, '```'] : []),
    '',
    '### The code',
    '',
    ...(pulls.length ? pulls.flatMap((p) => [`**${p.name}**: ${p.url}`, '', sectionOf(p.body, 'Proof') || 'No proof: no scenario of its part changed.', '']) : ['No repository has code to change.', '']),
    '### What it cost',
    '',
    ...(costs.length ? [...costs.map((c) => `- ${c}`), '', `About $${total.toFixed(2)} in all.`] : ['No agent run left its cost.']),
    '',
  ].join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const here = process.env.GITHUB_REPOSITORY
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 << 20 }).trim()
  const gh = (token, ...args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 << 20, env: { ...process.env, GH_TOKEN: token ?? '' } }).trim()
  const self = (...args) => gh(process.env.GH_TOKEN, ...args)
  const agent = (...args) => gh(process.env.AGENT_TOKEN, ...args)
  const say = (lines) => {
    console.log(lines.join('\n'))
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('  \n')}\n`)
  }
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const labelled = (label) => JSON.parse(self('issue', 'list', '--repo', here, '--state', 'open', '--label', label, '--limit', '200', '--json', 'number,title,body'))
  const comments = (n) => self('api', '--paginate', `repos/${here}/issues/${n}/comments`, '--jq', '.[]').split('\n').filter(Boolean).map((l) => JSON.parse(l))
  /** A file of a repository on `ref`, else on main. */
  const fileOf = (slug, path, ref) => {
    for (const at of [ref, 'main'].filter(Boolean)) {
      try {
        return Buffer.from(agent('api', `repos/${slug}/contents/${path}?ref=${encodeURIComponent(at)}`, '--jq', '.content'), 'base64').toString('utf8')
      } catch { /* Not on that branch. */ }
    }
    throw new Error(`${slug} has no ${path}`)
  }
  const scratch = mkdtempSync(join(tmpdir(), 'system-'))
  /** Each repository, where its code is on `ref` (else main), and what it has left of the model checked out. */
  const repositoriesAt = (ref) => {
    const nodes = readNodes(MODEL)
    const relations = readRelations(MODEL)
    const repositories = JSON.parse(readFileSync('.radical/system.json', 'utf8')).repositories.map(({ name, repo }) => {
      const slug = repo.match(/github\.com\/(.+?)(\.git)?$/)[1]
      const mapping = join(scratch, `${name}.json`)
      writeFileSync(mapping, fileOf(slug, '.radical/radical.json', ref))
      const { model } = JSON.parse(fileOf(slug, '.radical/reconciled.json', ref))
      return { name, slug, model, gap: gapOf(MODEL, readFileSync(mapping, 'utf8'), model), built: builtBy(nodes, mappedBy(mapping)) }
    })
    return { repositories, needs: dependenciesOf(relations, new Map(repositories.map((r) => [r.name, r.built]))) }
  }

  const [active] = labelled(LABELS.active)
  if (active) {
    const n = active.number
    const branch = branchOf(n)
    try {
      git('rev-parse', '-q', '--verify', `origin/${branch}`)
    } catch {
      say([`#${n} has no branch ${branch} yet: its model agent has not modelled it.`])
      process.exit(0)
    }
    git('checkout', '-q', `origin/${branch}`)
    const desired = git('rev-parse', 'HEAD')
    const said = comments(n)
    const { repositories, needs } = repositoriesAt(branch)
    const start = toStart(repositories, needs).filter((name) => !triedIn(said, name, desired))
    say([`#${n}, the model at ${desired.slice(0, 7)} on ${branch}:`, ...repositories.map(({ name, gap, model }) =>
      `${name}: at ${model.slice(0, 7)}, ${gap} change(s) to build${start.includes(name) ? ', starts now' : gap && triedIn(said, name, desired) ? ', tried' : gap ? ', waits' : ''}`)])
    for (const name of start) {
      const { slug, gap } = repositories.find((r) => r.name === name)
      agent('workflow', 'run', 'reconcile.yml', '--repo', slug, '--ref', 'main', '-f', `change=${n}`)
      self('issue', 'comment', String(n), '--repo', here, '--body', `${startMark(name, desired)}\nThe ${name} builds ${gap} change(s) of the model at ${desired.slice(0, 7)}, on its branch \`${branch}\`.`)
    }
    if (repositories.some((r) => r.gap > 0)) {
      try { self('issue', 'edit', String(n), '--repo', here, '--remove-label', LABELS.ready) } catch {}
      process.exit(0)
    }

    // Every repository has reached the branch: the change is ready once every gate of it is green.
    const pullsOf = (slug) => JSON.parse(agent('pr', 'list', '--repo', slug, '--head', branch, '--state', 'open', '--json', 'number,url,body,isDraft,headRefOid,statusCheckRollup'))
    // A gate that ran before the other side had its branch tested the two together with that side's main:
    // once all are built, each runs again, with every side on the branch.
    if (!said.some((c) => c.body?.startsWith(rerunMark(desired)))) {
      for (const { name, slug } of repositories) {
        for (const pull of pullsOf(slug)) {
          const [run] = JSON.parse(agent('run', 'list', '--repo', slug, '--branch', branch, '--commit', pull.headRefOid, '--event', 'pull_request', '--limit', '1', '--json', 'databaseId'))
          if (!run) continue
          try { agent('run', 'rerun', String(run.databaseId), '--repo', slug) } catch (error) { console.log(`The gate of the ${name} runs already: ${error.message.split('\n')[0]}`) }
        }
      }
      self('issue', 'comment', String(n), '--repo', here, '--body', `${rerunMark(desired)}\nEvery repository has built the model at ${desired.slice(0, 7)}. Each code gate runs once more, with every side on \`${branch}\`.`)
      await sleep(30_000)
    }
    let modelPull, pulls
    for (const until = Date.now() + 12 * 60_000; ; await sleep(20_000)) {
      ;[modelPull] = pullsOf(here)
      pulls = repositories.flatMap(({ name, slug }) => pullsOf(slug).map((p) => ({ ...p, name, slug })))
      const states = [modelPull, ...pulls].filter(Boolean).map((p) => checksOf(p.statusCheckRollup ?? []))
      if (!states.includes(null) || Date.now() > until) break
    }
    const red = [modelPull && { ...modelPull, slug: here }, ...pulls].filter(Boolean).filter((p) => checksOf(p.statusCheckRollup ?? []) !== true)
    if (red.length) {
      const now = comments(n)
      for (const p of red) {
        const mark = `<!-- red ${p.url} ${p.headRefOid} -->`
        if (now.some((c) => c.body?.startsWith(mark))) continue
        self('issue', 'comment', String(n), '--repo', here, '--body', `${mark}\nThe gate of ${p.url} is not green, so the change is not ready. A person looks, or the label agent:fix on that pull request asks its coding agent.`)
      }
      say([`#${n}: ${red.length} pull request(s) not green.`])
      process.exit(0)
    }
    if (comments(n).some((c) => c.body?.startsWith(`<!-- change: ready ${desired} `))) {
      say([`#${n} is ready, and waits for a person.`])
      process.exit(0)
    }
    for (const p of [modelPull && { ...modelPull, slug: here }, ...pulls].filter(Boolean)) {
      if (p.isDraft) agent('pr', 'ready', String(p.number), '--repo', p.slug)
    }
    const modelDiff = modelPull ? execFileSync('npx', ['radical', 'diff', MODEL, '--since', 'origin/main'], { encoding: 'utf8', maxBuffer: 64 << 20 }).trim().split('\n').slice(0, 40).join('\n') : ''
    writeFileSync(join(scratch, 'evidence.md'), evidence({ n, desired, modelPull, modelDiff, pulls }))
    self('issue', 'comment', String(n), '--repo', here, '--body-file', join(scratch, 'evidence.md'))
    self('issue', 'edit', String(n), '--repo', here, '--add-label', LABELS.ready, '--remove-label', LABELS.stuck)
    say([`#${n} is ready to accept.`])
  } else {
    // No change open: main has to be built. What is not becomes a ticket in the queue.
    const { repositories } = repositoriesAt('main')
    const desired = git('log', '-1', '--format=%H', '--', MODEL)
    say([`main, the model at ${desired.slice(0, 7)}:`, ...repositories.map(({ name, gap, model }) => `${name}: at ${model.slice(0, 7)}, ${gap} change(s) not built`)])
    const open = JSON.parse(self('issue', 'list', '--repo', here, '--state', 'open', '--limit', '200', '--json', 'number,body'))
    for (const { name, gap, model } of repositories.filter((r) => r.gap > 0)) {
      const mark = `<!-- drift ${name} -->`
      if (open.some((t) => t.body?.startsWith(mark))) continue
      self('issue', 'create', '--repo', here, '--label', LABELS.queued, '--title', `The ${name} has not reached the model on main`,
        '--body', `${mark}\nThe code of the ${name} on main has reached the model at ${model.slice(0, 7)}, and main has it at ${desired.slice(0, 7)}: ${gap} change(s) of its part are not built. Bring the code to the model on main; the model stays as it is.`)
      console.log(`A ticket for the ${name}.`)
    }
    const next = nextIn(labelled(LABELS.queued))
    if (next) self('workflow', 'run', 'change.yml', '--repo', here, '--ref', 'main', '-f', `ticket=${next}`)
    say([next ? `Starts #${next} from the queue.` : 'Nothing in the queue.'])
  }
}
