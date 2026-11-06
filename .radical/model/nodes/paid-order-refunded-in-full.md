---
id: "5e91fdd2-a5fb-4daa-a50f-bdac88b36847"
type: "requirement"
label: "Paid order refunded in full"
action: "the orders service shall refund the full amount paid for the order, once the warehouse has released the reservation of the order."
ears_type: "event-driven"
rationale: "The customer answered the brief's question: a cancelled paid order is refunded in full. The refund waits for the release, so a refused or unreachable release refunds nothing."
trigger: "a customer cancels an order that is paid and not yet shipped"
---
