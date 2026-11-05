#!/usr/bin/env node
// The loop of the whole system. The model on main is the state wanted, and each repository's
// .radical/reconciled.json the commit of it that its code has reached. For each repository this
// reads what of its part is not built yet, and starts the repositories whose work can go now: one
// that calls another (`interacts` in the model) goes after it. When none has anything left, the
// tickets of the model changes are done. It runs on every change of the model, when a repository
// reaches a new commit, and every day, so a lost event loses nothing. No AI runs here.
//
//   node pipeline/system.mjs     with GH_TOKEN (issues here), AGENT_TOKEN (starts the repositories)
import { execFileSync } from 'node:child_process'
import { appendFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gapSince, mappedBy, partOf, readNodes, readRelations } from './part.mjs'

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

/** The tickets the model was changed for: its agent's commits end in (#12). */
export const ticketsIn = (subjects) => [...new Set(subjects.flatMap((s) => s.match(/\(#(\d+)\)$/)?.[1] ?? []))]

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const here = process.env.GITHUB_REPOSITORY
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim()
  const gh = (token, ...args) => execFileSync('gh', args, { encoding: 'utf8', env: { ...process.env, GH_TOKEN: token ?? '' } }).trim()
  const nodes = readNodes(MODEL)
  const relations = readRelations(MODEL)
  const repositories = JSON.parse(readFileSync('.radical/system.json', 'utf8')).repositories.map(({ name, repo }) => {
    const folder = join('.agent/providers', name, '.radical')
    const mapped = mappedBy(join(folder, 'radical.json'))
    const { model } = JSON.parse(readFileSync(join(folder, 'reconciled.json'), 'utf8'))
    return { name, slug: repo.match(/github\.com\/(.+?)(\.git)?$/)[1], model, gap: gapSince(MODEL, model, mapped), built: partOf(nodes, relations, mapped).built }
  })
  const needs = dependenciesOf(relations, new Map(repositories.map((r) => [r.name, r.built])))
  const start = toStart(repositories, needs)
  const lines = repositories.map(({ name, gap, model }) => `${name}: at ${model.slice(0, 7)}, ${gap} change(s) to build${start.includes(name) ? ', starts now' : gap ? ', waits' : ''}`)
  console.log(lines.join('\n'))
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('  \n')}\n`)
  for (const name of start) gh(process.env.AGENT_TOKEN, 'workflow', 'run', 'reconcile.yml', '--ref', 'main', '--repo', repositories.find((r) => r.name === name).slug)
  if (repositories.every((r) => r.gap === 0)) {
    const desired = git('log', '-1', '--format=%H', '--', MODEL)
    const open = JSON.parse(gh(process.env.GH_TOKEN, 'issue', 'list', '--repo', here, '--state', 'open', '--label', 'agent:implement', '--limit', '200', '--json', 'number')).map((t) => String(t.number))
    const done = ticketsIn(git('log', '--author=radical-model-agent', '--format=%s').split('\n')).filter((n) => open.includes(n))
    for (const number of done) gh(process.env.GH_TOKEN, 'issue', 'close', number, '--repo', here, '--comment', `The code of every repository has reached the model at ${desired.slice(0, 7)}.`)
    console.log(`Every repository has reached the model${done.length ? `; closed ${done.map((n) => `#${n}`).join(', ')}` : ''}.`)
  }
}
