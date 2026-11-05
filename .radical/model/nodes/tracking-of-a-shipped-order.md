---
id: "f69a4191-c8cc-4836-bb49-055a56aedfce"
type: "requirement"
label: "Tracking of a shipped order"
action: "the orders service shall answer 200 with the body {trackingNumber, status, estimatedDeliveryDate}: the tracking number the warehouse gave the order, the carrier's status of that delivery, one of in-transit, delivered or lost, and the estimated delivery date the warehouse holds for that delivery, as a date like 2026-11-20 and exactly as the carrier gave it, or null when the carrier gave none. It shall change nothing."
ears_type: "event-driven"
rationale: "A customer whose order has shipped wants to know where it is and when it will arrive. The Warehouse books the carrier and holds the carrier's status and the estimated delivery date. The Shop reads them from the Warehouse's dispatch service, GET /dispatches/{reservationId}: it answers the tracking number, the carrier's status of a dispatched reservation, and its estimated delivery date. Assumption: an order returned after shipping has shipped, so it is answered as shipped."
trigger: "a client reads the tracking of an order that has shipped"
---
