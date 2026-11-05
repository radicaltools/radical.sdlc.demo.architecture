---
id: "9b5ede9f-eca0-4171-b5b7-e3ca3899e524"
type: "requirement"
label: "Return a dispatched reservation"
action: "the stock service shall add each line's quantity back to what is on hand and mark the reservation returned."
ears_type: "event-driven"
rationale: "The Shop takes back a shipped order within 14 days of shipping and checks the 14 days itself; the Warehouse only puts the goods back. The key makes a repeat safe, see the repeat requirements."
trigger: "a client returns a dispatched reservation with an Idempotency-Key header"
---
