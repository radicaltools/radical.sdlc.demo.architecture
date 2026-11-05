---
id: "401e5451-2f6e-47c8-827a-d994282b38da"
type: "requirement"
label: "Return of undispatched refused"
action: "the stock service shall answer 409 and change nothing."
ears_type: "unwanted-behaviour"
rationale: "Only dispatched goods can come back. It is refused as a release after dispatch is."
unwanted_condition: "a client returns, with an Idempotency-Key, a reservation that is held or released"
---
