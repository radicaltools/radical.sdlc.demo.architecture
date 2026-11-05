---
id: "f69a4191-c8cc-4836-bb49-055a56aedfce"
type: "requirement"
label: "Tracking of a shipped order"
action: "the orders service shall answer 200 with the body {trackingNumber, status, estimatedDelivery}: the tracking number the warehouse gave the order, the carrier's status of that delivery, one of in-transit, delivered or lost, as the warehouse answers it, and the estimated delivery date kept on the order, a date like 2026-11-20, as the carrier gave it. It shall change nothing."
ears_type: "event-driven"
rationale: "A customer whose order has shipped wants to know where it is and when it will arrive. The Warehouse books the carrier and holds the carrier's status. The Shop reads it from the Warehouse's dispatch service, GET /dispatches/{reservationId}: it answers the tracking number and the carrier's status of a dispatched reservation, one of in-transit, delivered or lost. The estimated delivery date is not read again: it is the date kept on the order when it shipped. Assumption: an order returned after shipping has shipped, so it is answered as shipped."
trigger: "a client reads the tracking of an order that has shipped"
---
