# radical.sdlc.demo.architecture

**One system, one model, several repositories.** A shop sells coffee gear and a warehouse sends it. The code is in two
repositories, the [Warehouse](https://github.com/radicaltools/radical.sdlc.demo.warehouse) and the
[Shop](https://github.com/radicaltools/radical.sdlc.demo.shop). The model of the whole system is here, and so is the
pipeline that takes a change from a ticket to merged code in both, with agents doing the work and deterministic checks
deciding.

| Repository | What it holds |
|---|---|
| **architecture** (this one) | The model of the whole system, and the pipeline of a change: tickets, the loop, acceptance |
| [warehouse](https://github.com/radicaltools/radical.sdlc.demo.warehouse) | Code: stock, reservations, dispatch. No model |
| [shop](https://github.com/radicaltools/radical.sdlc.demo.shop) | Code: prices, orders, notifications. No model |
| [standards](https://github.com/radicaltools/radical.sdlc.demo.standards) | The company's decisions and their sensors, the Gate, the agents. This model depends on it |

## The model

`.radical/model` describes the whole system in [Radical](https://radical.tools): the Customer, the Shop and the
Warehouse with their services and components, the external Carrier, the domain and the life of an order and a
reservation as state machines, the requirements in EARS with their scenarios, and the decisions (ADRs) with the
fitness functions that measure them. Open the folder in Radical Studio to see it; the views are in folders per system.

It depends on one other model, the [standards](https://github.com/radicaltools/radical.sdlc.demo.standards), named in
`.radical/model/deps.json` at a tag. Their decisions show here read-only, and this model applies them to its services
with `constrains`.

**On `main`, the model describes what is built.** A change reaches it only together with its code.

Each code repository says in its `.radical/radical.json` which elements of this model it builds (`implements`), which
test checks which scenario (`verifies`), and that its model is this one (`"model"`). That decides its **part**: the
elements it builds and all under them, the requirements they satisfy, the state machines and entities they answer for,
their scenarios, the ADRs that constrain them and those ADRs' fitness functions. The `radical` CLI (from 0.3.4) judges a
repository on its part only: `radical check` and `radical sense run` look at nothing else, and `radical diff --part`
lists what of it changed.

## How a change gets through

![A person opens a ticket. The model agent models the change of the whole system on a branch, says on the ticket what it understood, and a review agent reads the change against the ticket. After a green Gate the system loop starts the Warehouse first, because the Shop calls it, then the Shop, each building on the same branch. A coding agent's question goes to the model agent, who answers in the model, and the loop builds again. When every Gate is green, the evidence goes on the ticket, a person accepts it all at once, and the loop merges the model first, then the code.](docs/sdlc.svg)

Yellow is a person, violet an agent on Claude Code, and green has no AI and gives the same answer every time. The dark
boxes are the Gates, the one required check of each repository.

A change lives on one branch, `change/<n>` after its ticket's number, here and in every repository it touches, and
reaches `main` only when a person accepts all of it. One change goes at a time; the others wait in a queue.

1. **A ticket here**, with the label `agent:implement`, by someone with write access. If no change is open, it becomes
   the change; otherwise it waits in the queue.
2. **The model agent** models the change on `change/<n>`: both systems at once, what each does and what they ask of
   each other, as requirements and scenarios with the values a test can assert. It opens a draft pull request of the
   model, and puts on the ticket how it understood the ticket. Nobody waits for that: a comment on the ticket turns the
   change at any time.
3. **A review agent**, which did not make the change, reads it against the ticket: a side left out, a rule nobody asked
   for, a contradiction, a scenario without values. The model agent fixes what it found, once. The model's Gate checks it
   with `radical check`.
4. **The loop** (`system.yml`) reads, for each code repository, what of its part the branch has that its code has not,
   and starts the repositories in the order their calls give: the Warehouse first, because the Shop calls it. Each
   repository gets one try for each commit of the model.
5. **A coding agent** in that repository builds its part on its own `change/<n>`, from what changed in the model alone:
   it never sees the ticket. It binds its tests to the scenarios, and says what became of its run in a JSON shape. Code
   it built goes up in a draft pull request, with **the proof of its tests**: each test of a changed scenario fails with
   the code of `main` and passes with the branch's.
6. **Questions go up a level.** A coding agent's question goes to the model agent, which answers by changing the model;
   the loop then builds again. A question the model agent cannot answer, and the third question of one repository's
   agent, go to a person on the ticket (`agent:question`), and the person's comment starts the model agent again.
7. **Each Gate** runs the repository's tests and sensors and `radical check` of its part. Its test of the two systems
   together, `crosses`, runs this side with the other side's branch of the same change. Once every repository has built
   the change, the loop runs every Gate once more, so the last word is the two branches together.
8. **The evidence.** With every repository built and every Gate green, the pull requests leave draft, and the ticket gets
   what a person needs to decide (`change:ready`): what changed in the model, each pull request with its proof, and what
   the agents cost.
9. **Acceptance.** A person gives the ticket the label `agent:accept`. The pipeline merges the model first, then the
   code, closes the ticket, and starts the next change in the queue.

**Where a person comes in:** the ticket, a question the agents cannot answer, a comment that turns the change, a change
the agents could not finish (`change:stuck`), a sensor a change needs to send something new (the agents cannot change
sensors), and the acceptance. Nobody merges by hand.

**Where a change is** is its state, at the end of its ticket's text in a hidden block that only the pipeline writes: its
phase (queued, modelling, asking, building, ready, accepting, stuck, accepted), each repository's tries, how many
questions were asked, and every move with its reason. The phases and the moves allowed between them are a table in
`pipeline/state.mjs`. The labels `change:*` and `agent:question` are drawn from the state for people to see. A block that
is not what the pipeline wrote stops the change.

Every day the loop also looks at `main`: a code repository that has not reached the model there gets a ticket in the queue.

## Two changes through it

**[#22](https://github.com/radicaltools/radical.sdlc.demo.architecture/issues/22), "Delivery address":** a customer
gives the address their order goes to, and the carrier gets it.

| When (UTC) | What happened | Who |
|---|---|---|
| 09:49 | The ticket becomes the change | a person |
| 09:58 | The model of both sides on `change/22`, after the review; the Warehouse starts | model agent, review agent, the loop |
| 10:00–11:04 | The Warehouse's agent asks four times (a sensor that sends no address, how the carrier takes it, an address it cannot check), the Shop's once (the status of a refusal). The model agent answers in the model; what only a person knows goes to the ticket | coding agents, model agent |
| 10:15–10:30 | The sensors `crosses` and `smoke` send an address | a person |
| 10:18–11:05 | Four answers on the ticket: the carrier's field, an address the Warehouse forwards unchecked, 400 for a wrong order, a lowercase country kept in uppercase | a person |
| 11:10 | Both built: [Warehouse #13](https://github.com/radicaltools/radical.sdlc.demo.warehouse/pull/13), [Shop #10](https://github.com/radicaltools/radical.sdlc.demo.shop/pull/10) | coding agents |
| 11:14 | Every Gate green with both sides on the branch; the evidence on the ticket | the loop |
| 11:17 | `agent:accept`: [the model](https://github.com/radicaltools/radical.sdlc.demo.architecture/pull/23), then the code, merged in 18 seconds | a person, the loop |

1 h 25 min to ready, about $1.50 of agent runs. What it showed is fixed since: each repository has its own count of
questions, a model agent's question asked while it goes on reaches a person, and the Gate takes the pipeline's scripts
from the change's branch.

**[#26](https://github.com/radicaltools/radical.sdlc.demo.architecture/issues/26), "Out for delivery":** the carrier
reports a new status, and the tracking shows it. Modelled and reviewed, built by the Warehouse and then the Shop at the
first try, with no question: 9 minutes from the ticket to ready, about $0.33.

## What runs where

| Workflow here | Starts on | What it does |
|---|---|---|
| [`change.yml`](.github/workflows/change.yml) | `agent:implement`, a comment on the open change, a coding agent's question, `agent:accept` | the queue, the model agent and its review, questions, acceptance (`pipeline/change.mjs`) |
| [`system.yml`](.github/workflows/system.yml) | a change's branch moving, a code repository having pushed, every day | the loop: who has what left, who goes now, the evidence (`pipeline/system.mjs`) |
| [`reconcile-code.yml`](.github/workflows/reconcile-code.yml) | called by a code repository's `reconcile.yml` | its side: the coding agent on the branch, the proof, the pull request, a question (`pipeline/reconcile-code.mjs`) |
| [`gate.yml`](.github/workflows/gate.yml) | every pull request here | the model holds together (`radical check`), the pipeline's tests; no AI |

```
.radical/model/          the model of the whole system; deps.json names the standards
.radical/system.json     the code repositories
pipeline/change.mjs      a change from its ticket to its acceptance; the queue
pipeline/state.mjs       a change's state in its ticket: phases and moves
pipeline/system.mjs      the loop
pipeline/part.mjs        how much a repository has left (radical diff --part), and who builds what, for the order
pipeline/review.mjs      the review of a model change against its ticket (prompt in pipeline/agents/)
pipeline/said.mjs        asks an agent what became of its run, in a JSON shape
pipeline/reconcile-code.mjs   a code repository's side of the loop, and the proof of its tests
pipeline/crosses.mjs     the test of the two systems together
pipeline/model-agent-whole-system.md   tells the standards' model agent that the model is the whole system
tools/standards.mjs      fetches the standards at the model's tag, and the code repositories for the agents to read
```

**How a code repository reaches the model.** It holds no model. Its `tools/model.mjs` fetches this repository's commits
into its own git and unpacks the model into `.radical/model`, out of git: for its Gate, at the commit its
`.radical/reconciled.json` names, so a change of the model turns nothing red there until its code gets to it; for its
coding agent, as the change's branch has it, which is why `get_changes` and `radical diff --since` work there. The
pipeline's scripts, `crosses` among them, come from the tip of the change's branch. When the code reaches a commit of the
model, its pull request moves `reconciled.json` to it.

**The agents** are Claude Code (Haiku), run headless with the standards' skills and allow-lists: the model agent changes
only the model, a coding agent only its repository's code, tests and test bindings, and neither changes sensors or
workflows. They hold no credentials; the workflows commit for them and push. No AI runs in a Gate, the loop, the proof
or the merge.

## The two systems together

Each side's own tests use a stand-in for the other, so they cannot see a field named differently on each side. The
sensor `crosses` can. In the Gate of a pull request it starts that repository's code and the other's, from the same
change's branch or else `main`, with only the carrier standing in, and sends an order through every call the Shop makes
to the Warehouse: a refusal for short goods, payment, shipping, tracking, return. It checks that what the Warehouse
answers comes out of the Shop. It takes seconds and no AI.

Both sides of a change are tested and merged together, so a field can be renamed in one change. A change that breaks
the Shop with nothing for the Shop on the branch stays red. A coding agent cannot change `crosses`, so when a change
alters what an order has to carry, as #22's address did, a person changes it on the change's branch.

## Not here yet

- **Deployment, nightly runs and the testing agent.** The standards have them; this demo goes from a ticket to merged code.
- **More than one change at a time.** The next waits until the open one is accepted or closed.
- **Versions across repositories.** The Warehouse is not pinned in the Shop: the model orders the work, and the Gates
  read the other side's branch or `main`, so a Gate run again can answer otherwise once the other side moved.
- **Everything in the product.** The CLI knows a repository's part; Radical Studio and the MCP tools do not yet. The
  pipeline is scripts in `pipeline/`, and it adjusts the standards' agents on the fly: the model agent's skill, and a
  JSON answer the agents give besides their prose.

## Run it on your machine

```bash
npm ci
npm run standards        # .standards/, the agents' skills, and the code repositories in .agent/providers/
npm test                 # the pipeline's tests
npx radical check .radical/model
```

To run the pipeline on GitHub, the three repositories need the secrets `ANTHROPIC_API_KEY` and `AGENT_TOKEN`, a
fine-grained token on all three with Contents, Pull requests, Issues and Actions: read and write.
