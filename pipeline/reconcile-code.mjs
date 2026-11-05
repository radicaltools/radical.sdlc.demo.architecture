#!/usr/bin/env node
// A repository's side of the loop, on its checkout of the change's branch change/<n>, after
// `node tools/model.mjs --whole --ref change/<n>` and the standards. No AI runs here: the coding agent
// runs before `outcome`, and pipeline/said.mjs asks it what became of its run.
//
//   node .agent/system/pipeline/reconcile-code.mjs next            what to do now, on GITHUB_OUTPUT
//   node .agent/system/pipeline/reconcile-code.mjs outcome <said.json> <step>   what becomes of the agent's run
//   node .agent/system/pipeline/reconcile-code.mjs proof <base> <out.md>   the tests of the scenarios changed since base
//   node .agent/system/pipeline/reconcile-code.mjs neighbours <branch>    the other repositories, in .agent/providers/<name>/
import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { gapSince, mappedBy, partOf, readNodes, readRelations } from './part.mjs'
import { fits } from './said.mjs'

const MODEL = '.radical/model'
const run = (command, ...args) => execFileSync(command, args, { encoding: 'utf8', maxBuffer: 64 << 20 }).trim()

/** What becomes of the coding agent's run, from what it said and what it did:
 *  push its code, mark the commit of the model reached, ask the model agent. None of them: a person reads
 *  why. It reaches the commit only with nothing asked, so a question never makes a change look done. */
export function outcome({ said, changed, failed }) {
  const none = { push: false, mark: false, ask: false }
  if (failed || !fits(said, 'coding-agent') || said.result === 'could-not') return none
  if (said.result === 'built' && !changed) return none
  const asks = said.result === 'question' || said.questions.length > 0
  return { push: changed || !asks, mark: !asks, ask: asks }
}

/** The scenarios of the part that changed since `base`, with the tests bound to them. */
export function scenariosToProve(report, here, nodes, verifies) {
  const type = new Map(nodes.map((n) => [n.id, n.type]))
  const changed = [...report.elements.added, ...report.elements.changed].filter((e) => (e.type ?? type.get(e.id)) === 'scenario' && here.has(e.id))
  return changed.map((e) => ({ id: e.id, label: e.label, tests: verifies.find((v) => v.element === e.id)?.tests ?? [] }))
}

/** The proof as a pull request shows it. */
export function proofText(rows) {
  if (!rows.length) return 'No scenario of this part changed.'
  const mark = { proven: 'fails on main, passes here', 'not proven': 'not proven', none: 'no test bound' }
  return ['| Scenario | Test | |', '|---|---|---|', ...rows.map((r) => `| ${r.label} | ${r.test ? `\`${r.test}\`` : ''} | ${mark[r.state]}${r.why ? `: ${r.why}` : ''} |`)].join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2]

  if (command === 'next') {
    const { model: base } = JSON.parse(readFileSync('.radical/reconciled.json', 'utf8'))
    const desired = readFileSync('.agent/desired', 'utf8').trim()
    const gap = gapSince(MODEL, base, mappedBy('.radical/radical.json'))
    console.log(gap ? `work: ${gap} change(s) of the model at ${desired.slice(0, 7)} are not in the code.` : 'converged: the code has reached the model.')
    appendFileSync(process.env.GITHUB_OUTPUT ?? '/dev/null', [`step=${gap ? 'work' : 'converged'}`, `base=${base}`, `desired=${desired}`].map((l) => `${l}\n`).join(''))
  } else if (command === 'outcome') {
    const said = existsSync(process.argv[3]) ? JSON.parse(readFileSync(process.argv[3], 'utf8')) : null
    const facts = { said, changed: run('git', 'status', '--porcelain') !== '', failed: process.argv[4] !== 'success' }
    const { push, mark, ask } = outcome(facts)
    console.log(`The agent said: ${said ? `${said.result}. ${said.why}` : 'nothing in the shape asked'}. It ${facts.changed ? 'changed files' : 'changed nothing'}.`)
    console.log(push || ask ? `So: ${[push && 'push', mark && 'mark the model reached', ask && 'ask the model agent'].filter(Boolean).join(', ')}.` : 'So: a person reads why.')
    appendFileSync(process.env.GITHUB_OUTPUT ?? '/dev/null', `push=${push}\nmark=${mark}\nask=${ask}\nstuck=${!push && !ask}\n`)
  } else if (command === 'proof') {
    const [base, out] = process.argv.slice(3)
    const report = JSON.parse(run('npx', 'radical', 'diff', MODEL, '--since', base, '--format', 'json'))
    const nodes = readNodes(MODEL)
    const { here } = partOf(nodes, readRelations(MODEL), mappedBy('.radical/radical.json'))
    const { verifies = [] } = JSON.parse(readFileSync('.radical/radical.json', 'utf8'))
    const rows = scenariosToProve(report, here, nodes, verifies).flatMap(({ label, tests }) => {
      if (!tests.length) return [{ label, state: 'none' }]
      return tests.map((test) => {
        // The test fails with the code of main, and passes with this branch's.
        const gate = spawnSync('npx', ['radical', 'harden', '--gate', '--test', test, '--base', 'origin/main', '--runs', '1'], { encoding: 'utf8', maxBuffer: 64 << 20 })
        const why = gate.status === 0 ? '' : `${gate.stdout}\n${gate.stderr}`.trim().split('\n').filter(Boolean).pop()?.slice(0, 200).replaceAll('|', '/')
        return { label, test, state: gate.status === 0 ? 'proven' : 'not proven', why }
      })
    })
    writeFileSync(out, `${proofText(rows)}\n`)
    console.log(proofText(rows))
  } else if (command === 'neighbours') {
    const branch = process.argv[3]
    for (const { name, repo: address } of JSON.parse(readFileSync('.agent/system/.radical/system.json', 'utf8')).repositories) {
      if (address.includes(`/${process.env.GITHUB_REPOSITORY}.git`)) continue
      const dir = join('.agent/providers', name)
      // The other side as this change has it, else as main has it.
      const onBranch = spawnSync('git', ['ls-remote', '--exit-code', '--heads', address, branch]).status === 0
      execFileSync('git', ['clone', '--quiet', '--depth', '1', ...(onBranch ? ['--branch', branch] : []), address, dir], { stdio: 'inherit' })
      rmSync(join(dir, '.git'), { recursive: true, force: true })
      console.log(`${name}: ${onBranch ? branch : 'main'}.`)
    }
  } else {
    console.error('next, outcome, proof or neighbours?')
    process.exit(2)
  }
}
