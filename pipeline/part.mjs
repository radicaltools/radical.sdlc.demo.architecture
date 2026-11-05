#!/usr/bin/env node
// One repository's part of the one system model, as a folder `radical check` and `radical sense run`
// read as they are. The part is what the repository maps in `implements` of its .radical/radical.json
// and all under it, the requirements those elements satisfy with what they derive from, the state
// machines they implement with all under them, the entities they realise and those machines are of, the scenarios of those
// requirements and machines, the ADRs that constrain the elements, and the fitness functions of those
// ADRs. The ancestors come along, for the tree to hold. No AI runs here.
//
//   node pipeline/part.mjs <whole model> <out folder> <radical.json>
import { execSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

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

/** `built`: the elements under what the repository maps. `here`: the ids it answers for. `keep`: those and their ancestors. */
export function partOf(nodes, relations, mapped) {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const under = (node, roots) => { for (let at = node; at; at = byId.get(at.parentId)) if (roots.has(at.id)) return true; return false }
  const built = new Set(nodes.filter((n) => under(n, mapped)).map((n) => n.id))
  const sources = (type, targets) => relations.filter((r) => r.relationType === type && targets.has(r.targetId)).map((r) => r.sourceId)
  const targets = (type, from) => relations.filter((r) => r.relationType === type && from.has(r.sourceId)).map((r) => r.targetId)
  const requirements = new Set(targets('satisfies', built))
  for (let size = -1; size !== requirements.size;) { size = requirements.size; targets('derives', requirements).forEach((id) => requirements.add(id)) }
  const realised = new Set(targets('realises', built))
  const machines = new Set([...targets('implements', built), ...sources('lifecycle-of', realised)])
  const entities = [...realised, ...targets('lifecycle-of', machines)]
  const behaviour = nodes.filter((n) => under(n, machines)).map((n) => n.id)
  const adrs = new Set(sources('constrains', built))
  const here = new Set([...built, ...requirements, ...entities, ...behaviour, ...sources('verifies', new Set([...requirements, ...machines])), ...adrs, ...sources('implements', adrs)])
  const keep = new Set(here)
  for (const id of here) for (let at = byId.get(byId.get(id)?.parentId); at; at = byId.get(at.parentId)) keep.add(at.id)
  return { built, here, keep }
}

export const readRelations = (whole) => JSON.parse(readFileSync(join(whole, 'relations.json'), 'utf8'))
export const mappedBy = (mapping) => new Set(JSON.parse(readFileSync(mapping, 'utf8')).implements.map((m) => m.element))

/** Writes the part. An id no node has belongs to another model (deps.json), so its relations stay. */
export function writePart(whole, out, mapped) {
  const nodes = readNodes(whole)
  const relations = readRelations(whole)
  const { keep } = partOf(nodes, relations, mapped)
  const known = new Set(nodes.map((n) => n.id))
  const stays = (id) => !known.has(id) || keep.has(id)
  rmSync(out, { recursive: true, force: true })
  mkdirSync(out, { recursive: true })
  for (const name of readdirSync(whole)) if (!name.startsWith('.') && name !== 'nodes') cpSync(join(whole, name), join(out, name), { recursive: true })
  for (const node of nodes.filter((n) => keep.has(n.id))) {
    const to = join(out, 'nodes', relative(join(whole, 'nodes'), node.path))
    mkdirSync(dirname(to), { recursive: true })
    cpSync(node.path, to)
  }
  writeFileSync(join(out, 'relations.json'), JSON.stringify(relations.filter((r) => stays(r.sourceId) && stays(r.targetId)), null, 2))
  writeFileSync(join(out, 'views.json'), '[]\n')
  return { kept: nodes.filter((n) => keep.has(n.id)).length, of: nodes.length }
}

/** How many changes of a `radical diff --format json` report touch `ids`. */
export function gapIn({ elements, relations }, ids) {
  const touched = (list) => list.filter((e) => ids.has(e.id)).length
  const linked = (list) => list.filter((r) => ids.has(r.source?.id) || ids.has(r.target?.id)).length
  return ['added', 'changed', 'removed'].reduce((sum, kind) => sum + touched(elements[kind]) + linked(relations[kind]), 0)
}

/** What the repository still has to build since `commit`: changes of its part as it is now, and as it
 *  was then, so that an element taken out of the model counts too. The commit has to be in this git. */
export function gapSince(whole, commit, mapped) {
  const report = JSON.parse(execSync(`npx radical diff ${whole} --since ${commit} --format json`, { encoding: 'utf8', maxBuffer: 64 << 20 }))
  const then = mkdtempSync(join(tmpdir(), 'model-'))
  try {
    execSync(`git archive ${commit} ${whole} | tar -x -C ${then}`)
    const before = join(then, whole)
    const ids = new Set([
      ...partOf(readNodes(whole), readRelations(whole), mapped).here,
      ...partOf(readNodes(before), readRelations(before), mapped).here,
    ])
    return gapIn(report, ids)
  } finally {
    rmSync(then, { recursive: true, force: true })
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [whole, out, mapping] = process.argv.slice(2)
  const { kept, of } = writePart(whole, out, mappedBy(mapping))
  console.log(`This repository's part: ${kept} of ${of} elements.`)
}
