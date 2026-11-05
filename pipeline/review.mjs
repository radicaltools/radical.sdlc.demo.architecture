#!/usr/bin/env node
// The review of a model change before any code is written from it, by an agent that did not make it.
// The gate holds the model to its metamodel; this reads it against the ticket, which no deterministic
// check can: a side left out, a rule nobody asked for, a contradiction. It reads and changes nothing.
//
//   node pipeline/review.mjs <brief> <out.json>    writes { verdict, problems } and prints the cost
//
// Runs from the checkout, on the change's branch, with .standards/ there. Writes nothing when the agent
// gave no answer in the shape, and the step after reads that as a review that did not happen.
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export const SCHEMA = {
  type: 'object',
  required: ['verdict', 'problems'],
  additionalProperties: false,
  properties: {
    verdict: { enum: ['ok', 'problems'] },
    problems: { type: 'array', items: { type: 'string' } },
  },
}

const TOOLS = ['Read', 'Glob', 'Grep', 'Bash(npx radical diff*)', 'Bash(npx radical check*)', 'Bash(git diff*)', 'Bash(git log*)',
  ...['get_model_summary', 'search_model', 'get_changes', 'get_issues'].map((t) => `mcp__radical__${t}`)]

/** The review in the output of a claude -p run with SCHEMA, or null. A verdict "ok" has no problems. */
export function reviewIn(stdout) {
  try {
    const { verdict, problems } = JSON.parse(stdout).structured_output
    if (!['ok', 'problems'].includes(verdict) || !Array.isArray(problems) || !problems.every((p) => typeof p === 'string')) return null
    return verdict === 'ok' ? { verdict, problems: [] } : { verdict, problems }
  } catch {
    return null
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [brief, out] = process.argv.slice(2)
  const { agentEnvironment } = await import(join(process.cwd(), '.standards/pipeline/tools/agents.mjs'))
  const { DEFAULT_MODEL } = await import(join(process.cwd(), '.standards/pipeline/tools/run-agent.mjs'))
  const prompt = readFileSync(new URL('agents/model-review.md', import.meta.url), 'utf8').replaceAll('{brief}', brief)
  const run = spawnSync('claude', ['-p', prompt, '--model', process.env.AGENT_MODEL || DEFAULT_MODEL, '--max-turns', '30',
    '--mcp-config', '.mcp.json', '--strict-mcp-config', '--allowedTools', ...TOOLS,
    '--output-format', 'json', '--json-schema', JSON.stringify(SCHEMA)], {
    env: agentEnvironment(process.env), encoding: 'utf8', maxBuffer: 16 << 20, stdio: ['ignore', 'pipe', 'inherit'],
  })
  let cost = 0
  try { cost = JSON.parse(run.stdout).total_cost_usd ?? 0 } catch {}
  console.log(`model-review: $${cost.toFixed(3)}`)
  const review = reviewIn(run.stdout ?? '')
  if (!review) {
    console.log('The review gave no answer in the shape asked.')
    process.exit(0)
  }
  writeFileSync(out, `${JSON.stringify({ ...review, cost }, null, 2)}\n`)
  console.log(review.verdict === 'ok' ? 'The review found no problem.' : `The review found:\n${review.problems.map((p) => `- ${p}`).join('\n')}`)
}
