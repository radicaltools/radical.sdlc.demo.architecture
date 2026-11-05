---
id: "0ea83bb4-6c37-471b-a369-ca6abf5ab1b5"
type: "requirement"
label: "Repeated reservation held once"
action: "the stock service shall answer as it did the first time and hold nothing more."
ears_type: "unwanted-behaviour"
unwanted_condition: "a reservation comes with an idempotency key already seen and the same body"
---
