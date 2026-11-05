---
id: "43e15411-fea4-497a-9442-85d6ac891a59"
type: "component"
label: "Dispatcher"
technology: "TypeScript"
---

Books the carrier for a reservation, once per idempotency key. Asks the carrier the status of a dispatched reservation's delivery. Keeps each dispatched reservation's tracking number in the process, as it keeps the idempotency keys: a restart loses it.
