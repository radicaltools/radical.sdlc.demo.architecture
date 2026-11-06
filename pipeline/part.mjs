#!/usr/bin/env node
// A repository's part of the one system model. The CLI knows it since 0.3.4: a repository whose
// .radical/radical.json names the model ("model") is judged on its part by radical check and radical
// sense run, and radical diff --part lists what of its part changed. What is left here is what the loop
// needs of it: how much a repository has left to build, and which elements it builds, for the order.
// No AI runs here.
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

const walk = (folder) => readdirSync(folder).flatMap((name) => {
  const path = join(folder, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})

/** A field of a node file's frontmatter. */
const field = (frontmatter, key) => frontmatter.match(new RegExp(`^${key}: "?([^"\\n]+)"?$`, 'm'))?.[1]

/** The nodes of a model folder, each with the id of its parent: the _index.md of the folder it is in. */
export function readNodes(whole) {
  const files = walk(join(whole, 'nodes')).filter((path) => path.endsWith('.md')).map((path) => {
    const frontmatter = readFileSync(path, 'utf8').split('\n---')[0]
    return { id: field(frontmatter, 'id'), type: field(frontmatter, 'type'), path }
  })
  const owners = new Map(files.filter((n) => basename(n.path) === '_index.md').map((n) => [dirname(n.path), n.id]))
  return files.map((n) => ({ ...n, parentId: owners.get(basename(n.path) === '_index.md' ? dirname(dirname(n.path)) : dirname(n.path)) }))
}

export const readRelations = (whole) => JSON.parse(readFileSync(join(whole, 'relations.json'), 'utf8'))
export const mappedBy = (mapping) => new Set(JSON.parse(readFileSync(mapping, 'utf8')).implements.map((m) => m.element))

/** The elements a repository builds: those under what it maps. */
export function builtBy(nodes, mapped) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const under = (node) => { for (let at = node; at; at = byId.get(at.parentId)) if (mapped.has(at.id)) return true; return false }
  return new Set(nodes.filter(under).map((n) => n.id))
}

/** How many changes a `radical diff --format json` report holds. */
export const countOf = ({ elements, relations }) =>
  ['added', 'changed', 'removed'].reduce((sum, kind) => sum + elements[kind].length + relations[kind].length, 0)

/** What of the part changed since `commit`: radical diff --part, run on the model folder `folder`, whose
 *  repository's .radical/radical.json says what the part is. The commit has to be in that git. */
export const partSince = (folder, commit) =>
  JSON.parse(execFileSync('npx', ['radical', 'diff', folder, '--part', '--since', commit, '--format', 'json'], { encoding: 'utf8', maxBuffer: 64 << 20 }))

/** What another repository has left to build of the model checked out here: radical diff --part reads the
 *  mapping of the repository the model folder is in, so the model goes into a worktree of this repository
 *  with that mapping beside it. */
export function gapOf(model, mapping, commit) {
  const dir = mkdtempSync(join(tmpdir(), 'part-'))
  rmSync(dir, { recursive: true, force: true })
  execFileSync('git', ['worktree', 'add', '--quiet', '--detach', dir, 'HEAD'])
  try {
    mkdirSync(join(dir, '.radical'), { recursive: true })
    writeFileSync(join(dir, '.radical/radical.json'), mapping)
    return countOf(partSince(join(dir, model), commit))
  } finally {
    execFileSync('git', ['worktree', 'remove', '--force', dir])
  }
}
