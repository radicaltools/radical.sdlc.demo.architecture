# radical.tools.sdlc.demo.3.architecture

**One system, one model, several repositories.** A shop sells goods and a warehouse sends them. They are
built in two repositories, the [Warehouse](https://github.com/radicaltools/radical.tools.sdlc.demo.3.warehouse) and the [Shop](https://github.com/radicaltools/radical.tools.sdlc.demo.3.shop), and this repository holds the
model of the whole system.

An agent sees the whole system and changes it at once, in one pull request. The work is divided only for
building it: each repository's coding agent reads the whole model and builds its own part.

## How a change gets through

![A person opens a ticket. The model agent changes the model of the whole system in one pull request. A green Gate and a person's merge start the system loop, which reads what each repository has left and starts the Warehouse first, because the Shop calls it. Its coding agent builds its part, a green Gate and a merge start the loop again, and it starts the Shop. When nothing is left, the loop closes the ticket.](docs/sdlc.svg)

Yellow is a person, violet an agent on Claude Code, and green has no AI and gives the same answer every time. The dark box is the Gate, the one required check.

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

## The first ticket

A customer whose order has shipped wants to know when it will arrive: [ticket #2](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/issues/2), "Estimated delivery date".
It needs both repositories: the Warehouse has to keep the carrier's date, and the Shop has to show it.

| Step | What happened |
|---|---|
| Model of both sides | [#5](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/pull/5) changed the Warehouse's and the Shop's requirements in one pull request. An earlier try, [#3](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/pull/3), modelled only the Shop and was closed; [#4](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/pull/4) fixed why |
| The Warehouse goes first | The loop started it, and kept the Shop waiting |
| A gap in the model | Its agent asked what the carrier answers, and what if it gives no date. A person decided: the parcel goes on, and the date is null. That is [#6](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/issues/6) and [#7](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/pull/7) |
| A contradiction in the model | Its agent found 200 and 201 for one answer: [#9](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/issues/9) and [#10](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/pull/10). Those two questions threw built code away, so [#8](https://github.com/radicaltools/radical.tools.sdlc.demo.3.architecture/pull/8) now keeps it as a draft |
| The code | [The Warehouse's pull request](https://github.com/radicaltools/radical.tools.sdlc.demo.3.warehouse/pull/3), then, started by its merge, [the Shop's](https://github.com/radicaltools/radical.tools.sdlc.demo.3.shop/pull/1), at the first try and with no question |
| The end | The loop found nothing left, and closed the three tickets |

It took 8 agent runs and about $0.65, of which about $0.28 went on runs thrown away while the pipeline was being fixed.

## What is where

```
.radical/model/          the model of the whole system
.radical/system.json     the repositories that build it
pipeline/part.mjs        one repository's part of the model
pipeline/system.mjs      the loop: who has what left, who goes now
pipeline/reconcile-code.mjs, .github/workflows/reconcile-code.yml   a repository's side of it
pipeline/model-agent-whole-system.md   replaces what the standards' model agent says about other systems
pipeline/crosses.mjs     the test of the two systems together
docs/sdlc.svg            the diagram above
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

## The two together

Each side's own tests use a stand-in for the other, so they cannot see a field named differently on each side.
The sensor `crosses` can: in the Gate of a pull request it runs that repository's code and the other's `main`, with
only the carrier standing in, and sends an order through every call the Shop makes to the Warehouse. It checks that
what the Warehouse answers comes out of the Shop. It takes seconds and no AI.

So a Warehouse pull request that breaks the Shop on `main` is red in its own Gate, and a rename goes in steps: add
the new name, move the Shop, then remove the old one.

## Not here yet

- **Deployment, nightly runs, updates of pins and the testing agent.** This demo goes from a ticket to
  merged code.
- **Versions across repositories.** The Warehouse is not pinned in the Shop: the model orders the work, and
  the sensors `warehouse-contract` and `crosses` read the other side's `main`. So running a Gate again can
  give another answer once the other side has changed.
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
