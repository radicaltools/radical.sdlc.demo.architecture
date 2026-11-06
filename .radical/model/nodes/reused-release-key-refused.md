---
id: "41f7d3ae-4c5d-44a3-bb88-3605d4568b75"
type: "requirement"
label: "Reused release key refused"
action: "the stock service shall answer 422 and change nothing."
ears_type: "unwanted-behaviour"
rationale: "A key names one request. Mirrors the reused return key: the key of another reservation is not a repeat of this release."
unwanted_condition: "a client releases a reservation with an Idempotency-Key already seen for a different reservation"
---
