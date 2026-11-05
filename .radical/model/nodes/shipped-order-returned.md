---
id: "1b498c93-c6a9-40d4-8795-7694676a9200"
type: "requirement"
label: "Shipped order returned"
action: "the orders service shall have the warehouse return the reservation of the order, with the order's id as the idempotency key, and mark the order returned only once the warehouse has put the goods back on its shelves."
ears_type: "event-driven"
rationale: "The shop takes back a shipped order within 14 days of shipping; the warehouse puts the goods back on the shelves."
trigger: "a customer returns a shipped order no later than 14 days after the order was shipped"
---
