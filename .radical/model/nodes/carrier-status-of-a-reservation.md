---
id: "8b1f2f97-d3cc-4f65-9ed7-92f78097815d"
type: "requirement"
label: "Carrier status of a reservation"
action: "the dispatch service shall ask the carrier for the status of the dispatched reservation's parcel with GET /parcels/{trackingNumber}, and answer 200 with the reservation's tracking number, the status in the carrier's 200 answer, one of in-transit, out-for-delivery, delivered or lost, as the carrier reports it, the estimated delivery date kept for the reservation, or null when it has none, and deliveredAt: the value of the carrier's 200 answer field deliveredAt, the date and time the carrier reports the parcel was delivered, exactly as the carrier gave it, like 2026-11-21T10:30:00Z; that field is there only when the status is delivered, so deliveredAt is null when the status is not delivered or the carrier's answer has no deliveredAt field; and change nothing."
ears_type: "event-driven"
rationale: "The shop shows a customer where a shipped order is, and when a delivered one arrived. The read only asks the carrier; the reservation is not changed."
trigger: "a client asks for the carrier status of a dispatched reservation by its reservation id, and the dispatch service has not restarted since it dispatched the reservation"
---

Lets the shop tell a customer where a dispatched order is.
