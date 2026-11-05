---
id: "53b26261-597a-44ee-902c-709d87150a66"
type: "requirement"
label: "Return of returned refused"
action: "the stock service shall answer 409 and change nothing."
ears_type: "unwanted-behaviour"
rationale: "A repeated return must not put the goods back twice. A repeat with the same key is answered as before; a new key is refused."
unwanted_condition: "a client returns, with an Idempotency-Key not seen before, a reservation already returned"
---
