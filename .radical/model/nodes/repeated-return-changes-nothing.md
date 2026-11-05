---
id: "f673aaf6-d550-484e-b24a-e60783332f63"
type: "requirement"
label: "Repeated return changes nothing"
action: "the stock service shall answer as it did the first time and change nothing more."
ears_type: "unwanted-behaviour"
rationale: "A client that lost the answer repeats the return; the goods go back on the shelves once. The repeat may come after the first return or at the same time as it."
unwanted_condition: "a return comes with an Idempotency-Key already seen and the same body"
---
