---
id: "008f5df0-a1c6-4e6b-a2db-3109f84db60a"
type: "requirement"
label: "Status after restart"
action: "the dispatch service shall answer 503, not ask the carrier, and leave the reservation as it is."
ears_type: "unwanted-behaviour"
rationale: "The tracking number is kept in the dispatch process, as the idempotency keys are, so a restart loses it. Without it there is nothing to ask the carrier with. The reservation is not changed."
unwanted_condition: "the dispatch service has restarted since a reservation was dispatched, while a client asks for the carrier status of that reservation"
---

A reservation dispatched before a restart of the dispatch service has no tracking number in the process, so the carrier cannot be asked for its status.
