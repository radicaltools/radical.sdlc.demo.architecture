#!/usr/bin/env node
// Fetches the company's standards at the version this repository pins: the model's
// deps.json names it, and the pipeline's workflows must name the same one. They land in
// .standards/ (out of git), and the agents' skills in .claude/skills/. What the system's repositories
// have now lands in .agent/providers/<name>/, for the agents and the loop to read.
//
//   node tools/standards.mjs            fetch them
//   node tools/standards.mjs --check    only say whether the workflows name the pin
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

const MODEL = '.radical/model'
const dep = JSON.parse(readFileSync(join(MODEL, 'deps.json'), 'utf8')).dependencies.find((d) => d.name === 'standards')
if (!dep) throw new Error(`${MODEL}/deps.json names no standards`)

const USES = /uses:\s*\S*standards\/\.github\/workflows\/\S+@(\S+)/
const stale = readdirSync('.github/workflows', { withFileTypes: true }).filter((f) => f.isFile()).flatMap((f) => {
  const used = readFileSync(join('.github/workflows', f.name), 'utf8').match(USES)?.[1]
  return used && used !== dep.ref ? [`${f.name} uses the pipeline at ${used}, the model pins ${dep.ref}`] : []
})
if (stale.length) {
  for (const line of stale) console.error(`::error::${line}`)
  process.exit(1)
}
if (process.argv.includes('--check')) {
  console.log(`The workflows and the model name the standards at ${dep.ref}.`)
  process.exit(0)
}

const address = /^[a-z+]+:\/\/|^[^/]+@[^/]+:/.test(dep.repo) || isAbsolute(dep.repo) ? dep.repo : resolve(MODEL, dep.repo)
rmSync('.standards', { recursive: true, force: true })
const clone = spawnSync('git', ['-c', 'advice.detachedHead=false', 'clone', '-q', '--depth', '1', '--branch', dep.ref, address.startsWith('/') ? `file://${address}` : address, '.standards'], { stdio: 'inherit' })
if (clone.status !== 0) process.exit(clone.status ?? 1)
const skills = '.standards/pipeline/skills'
if (existsSync(skills)) {
  mkdirSync('.claude/skills', { recursive: true })
  cpSync(skills, '.claude/skills', { recursive: true })
}
// The standards' model agent works on the model of one system, and hands on what another has to do.
// Here it holds them all. Fails if the skill no longer says what this replaces.
const agent = '.claude/skills/model-agent/SKILL.md'
const skill = readFileSync(agent, 'utf8')
const whole = skill.replace(/   The model holds elements of other models[\s\S]*?(?=2\. \*\*A ticket\.\*\*)/, readFileSync('pipeline/model-agent-whole-system.md', 'utf8'))
if (whole === skill) throw new Error(`${agent} does not say what tools/standards.mjs replaces`)
writeFileSync(agent, whole)
console.log(`Standards at ${dep.ref} in .standards/.`)

for (const { name, repo } of JSON.parse(readFileSync('.radical/system.json', 'utf8')).repositories) {
  const dir = join('.agent/providers', name)
  rmSync(dir, { recursive: true, force: true })
  const copy = spawnSync('git', ['clone', '-q', '--depth', '1', repo, dir], { stdio: 'inherit' })
  if (copy.status !== 0) process.exit(copy.status ?? 1)
  rmSync(join(dir, '.git'), { recursive: true, force: true })
}
