---
id: "8b1f2f97-d3cc-4f65-9ed7-92f78097815d"
type: "requirement"
label: "Carrier status of a reservation"
action: "the dispatch service shall ask the carrier for the status of the dispatched reservation's parcel with GET /parcels/{trackingNumber}, and answer 200 with the reservation's tracking number and the status in the carrier's 200 answer, one of in-transit, delivered or lost, as the carrier reports it, and change nothing."
ears_type: "event-driven"
rationale: "The shop shows a customer where a shipped order is. The read only asks the carrier; the reservation is not changed."
trigger: "a client asks for the carrier status of a dispatched reservation by its reservation id, and the dispatch service has not restarted since it dispatched the reservation"
---

Lets the shop tell a customer where a dispatched order is.
