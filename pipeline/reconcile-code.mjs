#!/usr/bin/env node
// A repository's side of the loop, on its checkout, after `node tools/model.mjs --whole` and the
// standards. The rest of what the standards' reconcile.mjs says holds here too: one try per version
// of the model, one pull request or one ticket. No AI runs here.
//
//   node .agent/system/pipeline/reconcile-code.mjs next        what to do now, on GITHUB_OUTPUT
//   node .agent/system/pipeline/reconcile-code.mjs outcome <report> <step>   what became of the agent's run
//   node .agent/system/pipeline/reconcile-code.mjs neighbours  the other repositories, in .agent/providers/<name>/
import { execFileSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gapSince, mappedBy } from './part.mjs'

const MODEL = '.radical/model'
const PREFIX = 'agent/reconcile-'
const run = (command, ...args) => execFileSync(command, args, { encoding: 'utf8', maxBuffer: 64 << 20 }).trim()

/** What became of the agent's run. Code it built with a question goes up as a draft, with the question
 *  in its text: the work stays, the gate reads it, and a person decides. Anything else is as the standards say. */
export function outcome({ changed, failed, questions, otherwise }) {
  if (!failed && changed) return { act: 'pull', draft: questions }
  return { act: otherwise, draft: false }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repo = process.env.GITHUB_REPOSITORY
  const command = process.argv[2]

  if (command === 'next') {
    const { nextStep, branchOf } = await import(join(process.cwd(), '.standards/pipeline/tools/reconcile.mjs'))
    const { model: reconciled } = JSON.parse(readFileSync('.radical/reconciled.json', 'utf8'))
    const desired = readFileSync('.agent/desired', 'utf8').trim()
    const pulls = JSON.parse(run('gh', 'pr', 'list', '--repo', repo, '--state', 'all', '--limit', '200', '--json', 'number,state,headRefName')).filter((p) => p.headRefName.startsWith(PREFIX))
    const tickets = JSON.parse(run('gh', 'issue', 'list', '--repo', repo, '--state', 'all', '--label', 'agent:stuck', '--limit', '200', '--json', 'number,body,state')).filter((t) => t.body?.includes('<!-- reconcile '))
    const closes = tickets.filter((t) => t.state === 'OPEN').map((t) => t.number).join(' ')
    const { step, reason } = nextStep({ gap: gapSince(MODEL, reconciled, mappedBy('.radical/radical.json')), desired, pulls, tickets })
    console.log(`${step}: ${reason}.`)
    appendFileSync(process.env.GITHUB_OUTPUT ?? '/dev/null', [`step=${step}`, `base=${reconciled}`, `desired=${desired}`, `branch=${branchOf(desired)}`, `closes=${closes}`].map((l) => `${l}\n`).join(''))
  } else if (command === 'outcome') {
    const { outcomeOf } = await import(join(process.cwd(), '.standards/pipeline/tools/reconcile.mjs'))
    const { hasModelQuestions } = await import(join(process.cwd(), '.standards/pipeline/tools/questions.mjs'))
    const report = existsSync(process.argv[3]) ? readFileSync(process.argv[3], 'utf8') : ''
    const facts = { report, changed: run('git', 'status', '--porcelain') !== '', failed: process.argv[4] !== 'success' }
    const { act, draft } = outcome({ ...facts, questions: hasModelQuestions(report), otherwise: outcomeOf(facts) })
    console.log(`The agent's run ends in: ${act}${draft ? ', as a draft' : ''}.`)
    appendFileSync(process.env.GITHUB_OUTPUT ?? '/dev/null', `act=${act}\ndraft=${draft}\n`)
  } else if (command === 'neighbours') {
    for (const { name, repo: address } of JSON.parse(readFileSync('.agent/system/.radical/system.json', 'utf8')).repositories) {
      if (address.includes(`/${repo}.git`)) continue
      const dir = join('.agent/providers', name)
      execFileSync('git', ['clone', '--quiet', '--depth', '1', address, dir], { stdio: 'inherit' })
      rmSync(join(dir, '.git'), { recursive: true, force: true })
    }
  } else {
    console.error('next, outcome or neighbours?')
    process.exit(2)
  }
}
