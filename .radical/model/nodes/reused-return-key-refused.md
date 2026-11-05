---
id: "279ea47e-fd71-4585-8c82-863bdea7c436"
type: "requirement"
label: "Reused return key refused"
action: "the stock service shall answer 422 and change nothing."
ears_type: "unwanted-behaviour"
rationale: "A key names one request. The reservation id in the path is part of the request, since a return has no other body."
unwanted_condition: "a return comes with an Idempotency-Key already seen with a different body or for another reservation"
---
