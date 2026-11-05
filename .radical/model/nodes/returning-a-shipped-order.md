---
id: "4adb2969-b073-47bd-aede-d28f56d013d1"
type: "need"
label: "Returning a shipped order"
kind: "brief"
source: "issue-12"
---

A customer can return a shipped order within 14 days of shipping. The goods go back on the Warehouse's shelves, and the order becomes returned.

## Conversation

The agents asked:

The agents need an answer before they go on. Nothing has been committed.

1. **Does Warehouse v1.1.0 have a way to put dispatched goods back on the shelves?** I could not read the Warehouse's API here; the Shop only calls its reservation and dispatch operations. (a) It has one: build the Shop side against it. (b) It doesn't: the Warehouse needs that operation first, in its own repository, and this change waits for it. I would pick (a) if the operation exists, otherwise (b).
2. **Is a return exactly 14 days after shipping still accepted?** (a) Yes, 14 days is inclusive. (b) No, it must be under 14 days. I would pick (a), which is what the model currently says.

Answer in a comment here, all at once: the first comment starts them again.

tomasz-zajac-oss answered:

1 b
2 a

The pipeline said:

This needs warehouse: https://github.com/radicaltools/radical.tools.sdlc.demo.2.warehouse/issues/20

Its agents have started. Nothing has been committed here. The agents go on when that ticket is closed by a change and a version with it is pinned here.

The pipeline said:

radicaltools/radical.tools.sdlc.demo.2.warehouse#20 is closed, and v1.2.0, the version pinned here, has it.

tomasz-zajac-oss answered:

The agents proposed nothing, so no pull request was opened: https://github.com/radicaltools/radical.tools.sdlc.demo.2.shop/actions/runs/41855446457

The agents asked:

The agents need an answer before they go on. Nothing has been committed.

- **Refusal status code.** "Late or unshipped return refused" does not name an HTTP status for the refusal. When the work resumes, I would use 409, as the existing cancel and ship refusals do. Please confirm or name the code.

Answer in a comment here, all at once: the first comment starts them again.

tomasz-zajac-oss answered:

409

The agents asked:

The agents have asked 2 times and still need an answer, so this ticket needs a person.

- The need `Returning a shipped order` answers "Does Warehouse v1.1.0 have a way to put dispatched goods back?" with "b", meaning the Warehouse must add it first. The need's text names v1.1.0, but `deps.json` pins v1.2.0, and v1.2.0 does have `/reservations/{id}/return`. The answer looks stale. Please confirm whether the need should be re-answered.

tomasz-zajac-oss answered:

Odpowiedź „1 b” dotyczyła v1.1.0 i jest nieaktualna. v1.2.0 ma operację zwrotu, ale bez `Idempotency-Key`, więc ta część należy do Warehouse.

The pipeline said:

This needs warehouse: https://github.com/radicaltools/radical.tools.sdlc.demo.2.warehouse/issues/26

Its agents have started. Nothing has been committed here. The agents go on when that ticket is closed by a change and a version with it is pinned here.

The pipeline said:

radicaltools/radical.tools.sdlc.demo.2.warehouse#26 is closed, and v1.3.0, the version pinned here, has it.
