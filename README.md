# radical.tools.sdlc.demo.3.architecture

**One system, one model, several repositories.** A shop sells goods and a warehouse sends them. They are
built in two repositories, the [Warehouse](https://github.com/radicaltools/radical.tools.sdlc.demo.3.warehouse) and the [Shop](https://github.com/radicaltools/radical.tools.sdlc.demo.3.shop), and this repository holds the
model of the whole system.

An agent sees the whole system and changes it at once, in one pull request. The work is divided only for
building it: each repository's coding agent reads the whole model and builds its own part.

## How a change gets through

![A person opens a ticket. The model agent models the change of the whole system on a branch, says on the ticket what it understood, and a review agent reads the change against the ticket. After a green Gate the system loop starts the Warehouse first, because the Shop calls it, then the Shop, each building on the same branch. A coding agent's question goes to the model agent, who answers in the model, and the loop builds again. When every Gate is green, the evidence goes on the ticket, a person accepts it all at once, and the loop merges the model first, then the code.](docs/sdlc.svg)

Yellow is a person, violet an agent on Claude Code, and green has no AI and gives the same answer every time. The dark boxes are the Gates, the one required check of each repository.

A change lives on one branch, `change/<n>` after its ticket, here and in each repository it touches, and
reaches `main` only when a person accepts the whole of it. So `main` describes what is built: the model and
the code there agree. One change goes at a time, and the others wait in the queue.

1. **A ticket** with the label `agent:implement`, here. It becomes the change, or waits in the queue
   (`change:queued`).
2. **The model agent** models the change of the whole system on the branch, both sides of it at once. What
   it understood goes on the ticket, and nobody waits for an answer: a comment there turns it.
3. **A review agent**, which did not make the change, reads it against the ticket: a side left out, a rule
   nobody asked for, a contradiction. The model agent fixes what it found, once. Then the Gate checks the
   model with `radical check`.
4. **The loop** (`pipeline/system.mjs`) reads what of each repository's part is not built on its branch,
   and starts the repositories in order: the Warehouse first, because the Shop calls it. Each gets one try
   for each commit of the model.
5. **The coding agents** build their part on their branch `change/<n>`, from `get_changes` alone, and the
   pipeline asks each what became of its run, in a JSON shape. A question about the model goes to the model
   agent, which answers by changing the model, and the loop builds again. Only a question the model agent
   cannot answer goes to a person, on the ticket. A coding agent asks twice at most.
6. **Each Gate** runs the tests, the sensors and `radical check` of its part. Its test of the two systems
   together, `crosses`, takes the other side from the same branch. And each pull request carries the proof
   of its tests: each test of a changed scenario fails with the code of `main` and passes with the branch's.
7. **When everything is built and green**, the evidence goes on the ticket (`change:ready`): what changed in
   the model, each pull request with its proof, and what the agents cost.
8. **A person accepts it all** with the label `agent:accept`. The loop merges the model first, then the
   code, closes the ticket, and starts the next in the queue.

**Where a person comes in:** the ticket, a question only a person can answer, a comment that turns what the
model agent understood, a change `change:stuck` that the agents could not finish, and the acceptance.
Nobody merges anything by hand.

Once a day the loop also checks `main`: a repository whose code has not reached the model there gets a
ticket in the queue.

## The first ticket

It went through the earlier pipeline, where the model was merged on `main` first and the code followed.
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
pipeline/change.mjs, .github/workflows/change.yml   a change, from its ticket to its acceptance; the queue
pipeline/review.mjs, pipeline/agents/model-review.md   the review of a model change against its ticket
pipeline/said.mjs        asks an agent what became of its run, in a JSON shape
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
The sensor `crosses` can: in the Gate of a pull request it runs that repository's code and the other's, from the same change's branch or else `main`, with
only the carrier standing in, and sends an order through every call the Shop makes to the Warehouse. It checks that
what the Warehouse answers comes out of the Shop. It takes seconds and no AI.

Both sides of a change are tested together and merged together, so a rename of a field can go in one change.
The Warehouse builds first, and its Gate first runs with the Shop's `main`; once every repository has built
the change, the loop runs each Gate once more, with every side on the branch. A change that breaks the Shop
with nothing for the Shop on the branch stays red.

## Not here yet

- **Deployment, nightly runs, updates of pins and the testing agent.** This demo goes from a ticket to
  merged code.
- **Versions across repositories.** The Warehouse is not pinned in the Shop: the model orders the work, and
  the sensors `warehouse-contract` and `crosses` read the other side's branch or `main`. So running a Gate
  again can give another answer once the other side has changed.
- **Support in the product.** The part is worked out by `pipeline/part.mjs`, which reads the model's files
  directly, and Radical Studio and the MCP tools know nothing of it. Two things are also changed on
  the fly: the model agent's skill in `tools/standards.mjs`, and the commands the coding agent checks
  its work with, in `reconcile-code.yml`. The standards' model and coding agents report in prose, so
  `pipeline/said.mjs` asks each once more, in its own session, what became of its run, in a JSON shape.
- **More than one change at a time.** The next waits until the open one is accepted or closed.

## Run it on your machine

```bash
npm ci
npm run standards        # .standards/, the agents' skills, and the repositories in .agent/providers/
npm test
```

Open `.radical/model` in [Radical Studio](https://radical.tools) after `npx radical federation fetch`.

To run the pipeline on GitHub, each of the three repositories needs the secrets `ANTHROPIC_API_KEY` and
`AGENT_TOKEN`, a fine-grained token on all three, with Contents, Pull requests, Issues and Actions: read and write.
