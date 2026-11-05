---
id: "646b85a6-b01b-4f6c-a33e-1b28e683ebe7"
type: "requirement"
label: "Paying reserves the goods"
action: "the orders service shall reserve its lines in the warehouse, with the order's id as the idempotency key, and mark the order paid only once they are held."
ears_type: "event-driven"
trigger: "a customer pays a placed order"
---
