# radical.tools.sdlc.demo.3.architecture

**One system, one model, several repositories.** This repository holds the model of the whole system.
The [Warehouse](https://github.com/radicaltools/radical.tools.sdlc.demo.3.warehouse) and the
[Shop](https://github.com/radicaltools/radical.tools.sdlc.demo.3.shop) build it. The company's
standards stay a dependency, in [demo.2](https://github.com/radicaltools/radical.tools.sdlc.demo.2.standards).

In [demo.2](https://github.com/radicaltools/radical.tools.sdlc.demo.2.standards#readme) each system has
its own model, and a change across two systems travels as tickets between their agents. Here one agent
sees the whole system and changes it at once. The work is divided only for building it.

## How a change gets through

```
a ticket here, labelled agent:implement
  → the model agent changes the whole model, in one pull request; a person merges it
  → system.yml reads what each repository has not built, and starts those it can:
    one that calls another goes after it
  → that repository's coding agent reads the whole model and proposes its part; a person merges it
  → the repository tells system.yml, which starts the next one
  → when no repository has anything left, the ticket closes
```

The model on `main` is the state wanted, and agents bring the code to it. Each repository's
`.radical/reconciled.json` names the commit of the model its code has reached, and what it still has
to build is what changed in its part since then. The loop reads this again on every change of the
model, whenever a repository reaches a new commit, and once a day, so a lost event loses nothing.

**Where a person comes in:**

- **A model pull request.** Read and merge it. Use a merge commit, not a squash: the number of the ticket
  at the end of the agent's commit is how the loop knows which ticket to close.
- **A code pull request.** The Gate decides whether it can go in, and a person merges it.
- **A draft pull request.** The coding agent built the code but has a question about the model. The
  question is in its text and the Gate has read the code. Answer by marking it ready, or by
  changing the model in a new ticket and closing the draft.
- **A ticket `agent:stuck`, in the repository.** The agent built nothing, and says why. A new version of
  the model gives it another try; each version gets one.

A question of the model agent goes on the ticket, and an answer in a comment starts it again.

## What is where

```
.radical/model/          the model of the whole system
.radical/system.json     the repositories that build it
pipeline/part.mjs        one repository's part of the model
pipeline/system.mjs      the loop: who has what left, who goes now
pipeline/reconcile-code.mjs, .github/workflows/reconcile-code.yml   a repository's side of it
pipeline/model-agent-whole-system.md   replaces what the standards' model agent says about other systems
```

A repository holds no model. It keeps `.radical/radical.json` (which folder builds which element,
which test checks which scenario) and `.radical/reconciled.json`. Its `tools/model.mjs` fetches the
model's commits into its own git and unpacks the model into `.radical/model`, out of git:

- **For its Gate:** its part, at the commit `reconciled.json` names. A change of the model turns no
  repository red until its code gets there.
- **For its coding agent:** the whole model as `main` has it, with the part in `.agent/part`. The
  commits being in its git is why `get_changes` works there.

A repository's part is what it maps in `implements`, all under it, the requirements, state machines and
entities those elements answer for, their scenarios, the ADRs that constrain them and the fitness functions
of those ADRs.

## Not here yet

- **Deployment, nightly runs, updates of pins and the testing agent.** This demo goes from a ticket to
  merged code.
- **Versions across repositories.** The Warehouse is not pinned in the Shop: the model orders the work, and
  the Shop's sensor `warehouse-contract` reads the Warehouse's OpenAPI descriptions on its `main`. So
  running a Shop Gate again can give another answer once the Warehouse has changed.
- **Support in the product.** The part is worked out by `pipeline/part.mjs`, which reads the model's files
  directly, and Radical Studio and the MCP tools know nothing of it. Two things are also changed on
  the fly: the model agent's skill in `tools/standards.mjs`, and the commands the coding agent checks
  its work with, in `reconcile-code.yml`.

## Run it on your machine

```bash
npm ci
npm run standards        # .standards/, the agents' skills, and the repositories in .agent/providers/
npm test
```

Open `.radical/model` in [Radical Studio](https://radical.tools) after `npx radical federation fetch`.

To run the pipeline on GitHub, each of the three repositories needs the secrets `ANTHROPIC_API_KEY` and
`AGENT_TOKEN`, a fine-grained token on all three, with Contents, Pull requests, Issues and Actions: read and write.
