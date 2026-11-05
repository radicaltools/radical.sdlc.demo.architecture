# radical.tools.sdlc.demo.3.architecture

**One system, one model, several repositories.** This repository holds the model of the whole system;
the [Warehouse](https://github.com/radicaltools/radical.tools.sdlc.demo.3.warehouse) and the
[Shop](https://github.com/radicaltools/radical.tools.sdlc.demo.3.shop) build it. The company's
standards stay a dependency, in [demo.2](https://github.com/radicaltools/radical.tools.sdlc.demo.2.standards).

In [demo.2](https://github.com/radicaltools/radical.tools.sdlc.demo.2.standards#readme) each system has
its own model, and a change across two systems travels as tickets between their agents. Here an agent
sees the whole system and changes it at once, and the work is divided only for building it.

```
a ticket here, agent:implement
  → the model agent changes the whole model, in one pull request; a person merges it
  → system.yml reads what each repository has not built, and starts those it can:
    one that calls another goes after it
  → each repository's coding agent reads the whole model and proposes its code; a person merges it
  → the repository tells system.yml, which starts the next one
  → when none has anything left, the ticket closes
```

```
.radical/model/          the model of the whole system
.radical/system.json     the repositories that build it
pipeline/part.mjs        one repository's part of the model
pipeline/system.mjs      the loop: who has what left, who goes now
pipeline/reconcile-code.mjs, .github/workflows/reconcile-code.yml   a repository's side of it
```

A repository holds no model. It keeps `.radical/radical.json` (which folder builds which element,
which test checks which scenario) and `.radical/reconciled.json` (the commit of the model its code has
reached). Its `tools/model.mjs` fetches the model's commits into its own git and unpacks the model into
`.radical/model`, out of git: the part at that commit for the gate, so that a change of the model never
turns a repository red; the whole model at main for its agent, which is why `get_changes` works there.

A version of the Warehouse is no longer pinned in the Shop: the order of the work comes from the model.
This demo has no deployment yet.
