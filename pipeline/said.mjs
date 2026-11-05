#!/usr/bin/env node
// What an agent says became of its run, asked of it in its own session (claude -p --continue), so it
// answers about what it did, at the price of a cached read. Claude Code holds the answer to a JSON
// shape, and the pipeline reads that, never headings in the agent's prose.
//
//   node pipeline/said.mjs <agent> <out.json>    asks the agent that ran last in this folder; two tries
//
// Writes nothing when neither try answered in the shape, and the step after reads that as no answer.
// Runs from the checkout, with .standards/ there.
import { spawnSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

/** What each agent can say became of its run, and what each answer means. */
export const RESULTS = {
  'coding-agent': {
    built: 'you changed code, tests or bindings for what get_changes listed',
    'no-code': 'what get_changes listed asks for no code, and you changed nothing for it',
    question: 'the model is missing something or is wrong, whatever you built',
    'could-not': 'you could not finish for any other reason',
  },
  'model-agent': {
    modelled: 'you changed the model for the brief',
    'no-change': 'the model already says all the brief asks, and you changed nothing',
    question: 'a person has to answer before the model can say it, and you changed nothing',
    'could-not': 'you could not finish for any other reason, going against an ADR among them',
  },
}

export const schemaOf = (agent) => ({
  type: 'object',
  required: ['result', 'why', 'questions'],
  additionalProperties: false,
  properties: {
    result: { enum: Object.keys(RESULTS[agent]) },
    why: { type: 'string' },
    questions: { type: 'array', items: { type: 'string' } },
  },
})

export const askOf = (agent) => [
  `Your run as the ${agent} is over. Answer for the pipeline, which reads only this answer, about the run you just did.`,
  ...Object.entries(RESULTS[agent]).map(([result, meaning]) => `result "${result}" if ${meaning};`),
  'why: one or two sentences. questions: each question for a person, or none. Use no tools.',
].join('\n')

/** Whether `said` is an answer of `agent` in the shape asked. */
export function fits(said, agent) {
  return Boolean(RESULTS[agent]?.[said?.result]) && typeof said.why === 'string' &&
    Array.isArray(said.questions) && said.questions.every((q) => typeof q === 'string')
}

/** The answer in the output of a claude -p run with the schema, or null when it gave none in that shape. */
export function saidIn(stdout, agent) {
  try {
    const said = JSON.parse(stdout).structured_output
    return fits(said, agent) ? said : null
  } catch {
    return null
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [agent, out] = process.argv.slice(2)
  if (!RESULTS[agent] || !out) {
    console.error(`node pipeline/said.mjs <${Object.keys(RESULTS).join('|')}> <out.json>`)
    process.exit(2)
  }
  const { agentEnvironment } = await import(join(process.cwd(), '.standards/pipeline/tools/agents.mjs'))
  const { DEFAULT_MODEL } = await import(join(process.cwd(), '.standards/pipeline/tools/run-agent.mjs'))
  let cost = 0
  const spent = () => console.log(`${agent}-answer: $${cost.toFixed(3)}`)
  for (let attempt = 1; attempt <= 2; attempt++) {
    const answer = spawnSync('claude', ['-p', askOf(agent), '--continue', '--model', process.env.AGENT_MODEL || DEFAULT_MODEL,
      '--max-turns', '5', '--output-format', 'json', '--json-schema', JSON.stringify(schemaOf(agent))], {
      env: agentEnvironment(process.env), encoding: 'utf8', maxBuffer: 16 << 20, stdio: ['ignore', 'pipe', 'inherit'],
    })
    try { cost += JSON.parse(answer.stdout).total_cost_usd ?? 0 } catch {}
    const said = saidIn(answer.stdout ?? '', agent)
    if (said) {
      spent()
      writeFileSync(out, `${JSON.stringify(said, null, 2)}\n`)
      console.log(`The ${agent} says: ${said.result}. ${said.why}`)
      for (const question of said.questions) console.log(`  - ${question}`)
      process.exit(0)
    }
    console.log(`Try ${attempt}: the ${agent} said nothing in the shape asked.`)
  }
  spent()
}
