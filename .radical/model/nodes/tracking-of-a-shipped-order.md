---
id: "f69a4191-c8cc-4836-bb49-055a56aedfce"
type: "requirement"
label: "Tracking of a shipped order"
action: "the orders service shall answer 200 with the body {trackingNumber, status, estimatedDeliveryDate, deliveredAt}: the tracking number the warehouse gave the order, the carrier's status of that delivery, one of in-transit, delivered or lost, the estimated delivery date the warehouse holds for that delivery, as a date like 2026-11-20 and exactly as the carrier gave it, or null when the carrier gave none, and the delivery date and time the warehouse holds for that delivery, as a date and time like 2026-11-21T10:30:00Z and exactly as the carrier gave it, or null when the status is not delivered or the warehouse holds no time for a delivered one. It shall change nothing."
ears_type: "event-driven"
rationale: "A customer whose order has shipped wants to know where it is and when it will arrive, and once delivered, when it arrived. The Warehouse books the carrier and holds the carrier's status, the estimated delivery date and the delivery time. The Shop reads them from the Warehouse's dispatch service, GET /dispatches/{reservationId}: it answers the tracking number, the carrier's status of a dispatched reservation, its estimated delivery date and its delivery time. Assumption: an order returned after shipping has shipped, so it is answered as shipped."
trigger: "a client reads the tracking of an order that has shipped"
---
