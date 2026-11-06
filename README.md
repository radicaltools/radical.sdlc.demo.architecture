# radical.sdlc.demo.architecture

**One system, one model, several repositories.** A shop sells goods and a warehouse sends them. They are
built in two repositories, the [Warehouse](https://github.com/radicaltools/radical.sdlc.demo.warehouse) and the [Shop](https://github.com/radicaltools/radical.sdlc.demo.shop), and this repository holds the
model of the whole system.

An agent sees the whole system and changes it at once, in one pull request. The work is divided only for
building it: each repository's coding agent reads the whole model and builds its own part.

The model depends on one other: the company's [standards](https://github.com/radicaltools/radical.sdlc.demo.standards),
pinned in `.radical/model/deps.json`. Their decisions and fitness functions show in this model read-only, and
the standards also give the Gate and the agents' skills, at the same version.

## How a change gets through

![A person opens a ticket. The model agent models the change of the whole system on a branch, says on the ticket what it understood, and a review agent reads the change against the ticket. After a green Gate the system loop starts the Warehouse first, because the Shop calls it, then the Shop, each building on the same branch. A coding agent's question goes to the model agent, who answers in the model, and the loop builds again. When every Gate is green, the evidence goes on the ticket, a person accepts it all at once, and the loop merges the model first, then the code.](docs/sdlc.svg)

Yellow is a person, violet an agent on Claude Code, and green has no AI and gives the same answer every time. The dark boxes are the Gates, the one required check of each repository.

A change lives on one branch, `change/<n>` after its ticket, here and in each repository it touches, and
reaches `main` only when a person accepts the whole of it. So `main` describes what is built: the model and
the code there agree. One change goes at a time, and the others wait in the queue.

1. **A ticket** with the label `agent:implement`, here. It becomes the change, or waits in the queue
   (`change:queued`).
2. **The model agent** models the change of the whole system on the branch, both sides of it at once. What
   it understood goes on the ticket, and nobody waits for an answer: a comment there turns it. A question
   only a person can answer stops it (`agent:question`); one it asks while it goes on gets the same label,
   and the change goes on.
3. **A review agent**, which did not make the change, reads it against the ticket: a side left out, a rule
   nobody asked for, a contradiction. The model agent fixes what it found, once. Then the Gate checks the
   model with `radical check`.
4. **The loop** (`pipeline/system.mjs`) reads what of each repository's part is not built on its branch,
   and starts the repositories in order: the Warehouse first, because the Shop calls it. Each gets one try
   for each commit of the model.
5. **The coding agents** build their part on their branch `change/<n>`, from `get_changes` alone, and the
   pipeline asks each what became of its run, in a JSON shape. A question about the model goes to the model
   agent, which answers by changing the model, and the loop builds again. Only a question the model agent
   cannot answer goes to a person, on the ticket. Each repository's coding agent may ask the model agent
   twice; its next question goes to a person.
6. **Each Gate** runs the tests, the sensors and `radical check` of its part. Its test of the two systems
   together, `crosses`, takes the other side from the same branch. And each pull request carries the proof
   of its tests: each test of a changed scenario fails with the code of `main` and passes with the branch's.
7. **When everything is built and green**, the evidence goes on the ticket (`change:ready`): what changed in
   the model, each pull request with its proof, and what the agents cost.
8. **A person accepts it all** with the label `agent:accept`. The loop merges the model first, then the
   code, closes the ticket, and starts the next in the queue.

**Where a change is** is its state, kept at the end of its ticket's text in a hidden block that only the
pipeline writes (`pipeline/state.mjs`): its phase (queued, modelling, asking, building, ready, accepting,
stuck, accepted), each repository's tries, how many questions were asked, and every move with its reason.
The labels `change:*` and `agent:question` are drawn from it; leave the block alone, as a block that is not
what the pipeline wrote stops the change.

**Where a person comes in:** the ticket, a question only a person can answer, a comment that turns what the
model agent understood, a change `change:stuck` that the agents could not finish, and the acceptance.
Nobody merges anything by hand.

Once a day the loop also checks `main`: a repository whose code has not reached the model there gets a
ticket in the queue.

## A change through it

[Ticket #22](https://github.com/radicaltools/radical.sdlc.demo.architecture/issues/22), "Delivery address": a
customer gives the address their order goes to, and the carrier gets it. Both repositories change: the Shop
takes the address and passes it on, the Warehouse books the carrier with it.

| When (UTC) | What happened | Who |
|---|---|---|
| 09:49 | The ticket, labelled `agent:implement`, becomes the change | a person |
| 09:58 | The model of both sides on `change/22`, after the review; the Warehouse starts | model agent, review agent, the loop |
| 10:00–11:04 | The Warehouse's agent asks four times (a sensor that sends no address, how the carrier takes it, an address it cannot check), the Shop's once (the status of a refusal). The model agent answers in the model; what only a person knows goes to the ticket | coding agents, model agent |
| 10:15–10:30 | The sensors `crosses` and `smoke` send an address: a coding agent cannot change a sensor | a person |
| 10:18–11:05 | Four answers on the ticket: the carrier's field, an address the Warehouse forwards unchecked, 400 for a wrong order, a lowercase country kept in uppercase | a person |
| 11:10 | Both repositories built: [Warehouse #13](https://github.com/radicaltools/radical.sdlc.demo.warehouse/pull/13), [Shop #10](https://github.com/radicaltools/radical.sdlc.demo.shop/pull/10) | coding agents |
| 11:14 | Every Gate green with both sides on the branch; the evidence on the ticket | the loop |
| 11:17 | `agent:accept`: [the model](https://github.com/radicaltools/radical.sdlc.demo.architecture/pull/23), then the code, merged in 18 seconds | a person, the loop |

1 h 25 min from the ticket to ready, and about $1.50 of agent runs; the model agent ran eleven times, with its
review each time. 8 of the changed scenarios have a test that fails on `main` and passes on the branch; 5 have
tests that pass on `main` too, as only their text changed. What #22 showed is fixed since: each repository
has its own count of questions, a model agent's question besides its model goes to a person, and the
pipeline's scripts come from the change's branch.

The [first ticket](https://github.com/radicaltools/radical.sdlc.demo.architecture/issues/2), "Estimated delivery
date", went through an earlier pipeline, where the model was merged on `main` before the code.

## What is where

```
.radical/model/          the model of the whole system
.radical/system.json     the repositories that build it
pipeline/part.mjs        how much a repository has left (radical diff --part), and what it builds, for the order
pipeline/system.mjs      the loop: who has what left, who goes now
pipeline/reconcile-code.mjs, .github/workflows/reconcile-code.yml   a repository's side of it
pipeline/model-agent-whole-system.md   replaces what the standards' model agent says about other systems
pipeline/crosses.mjs     the test of the two systems together
pipeline/change.mjs, .github/workflows/change.yml   a change, from its ticket to its acceptance; the queue
pipeline/review.mjs, pipeline/agents/model-review.md   the review of a model change against its ticket
pipeline/said.mjs        asks an agent what became of its run, in a JSON shape
pipeline/state.mjs       a change's state in its ticket: its phases and the moves between them
docs/sdlc.svg            the diagram above
```

A repository holds no model. It keeps `.radical/radical.json`, which names this repository as the model's
(`"model"`), says which folder builds which element and which test checks which scenario, and
`.radical/reconciled.json`. Its `tools/model.mjs` fetches the model's commits into its own git and unpacks
the whole model into `.radical/model`, out of git:

- **For its Gate:** at the commit `reconciled.json` names. A change of the model turns no repository red
  until its code gets there.
- **For its coding agent:** as the change's branch has it. The commits being in its git is why
  `get_changes` works there.

Because `.radical/radical.json` names the model, the CLI (from 0.3.4) judges the repository on its part of
it: `radical check` and `radical sense run` look only at the part, and `radical diff --part` lists what of
it changed, which is what the repository has left to build. A repository's part is what it maps in
`implements`, all under it, the requirements, state machines and entities those elements answer for, their
scenarios, the ADRs that constrain them and the fitness functions of those ADRs.

## The two together

Each side's own tests use a stand-in for the other, so they cannot see a field named differently on each side.
The sensor `crosses` can: in the Gate of a pull request it runs that repository's code and the other's, from the same change's branch or else `main`, with
only the carrier standing in, and sends an order through every call the Shop makes to the Warehouse. It checks that
what the Warehouse answers comes out of the Shop. It takes seconds and no AI.

The Gate takes the pipeline's scripts, `crosses` among them, from the tip of the change's branch, and a
coding agent cannot change a sensor. So when a change alters what the test has to send, as the address of
#22 did, a person changes the test on the branch, and it counts from that push.

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
- **Support in the product.** The CLI knows a repository's part, but Radical Studio and the MCP tools do
  not: `get_issues` in a code repository judges the whole model. The loop still reads the model's files to
  know which repository builds which element, and puts the model in a worktree with a repository's mapping
  to run `radical diff --part` for it. And the model agent's skill is changed on the fly in
  `tools/standards.mjs`. The standards' model and coding agents report in prose, so
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
