---
id: "cc0024d1-1b47-4deb-a9b4-1aa24734b508"
type: "requirement"
label: "Carrier status in OpenAPI"
action: "the dispatch service shall describe GET /dispatches/{reservationId} in its OpenAPI description, with a 200 answer holding the tracking number, the status, one of in-transit, out-for-delivery, delivered or lost, as the carrier reports it, the estimated delivery date (a date, or null when the carrier gave none), and deliveredAt (a date and time like 2026-11-21T10:30:00Z, or null when the status is not delivered or the carrier gave no time for a delivered one), 404 for a reservation that does not exist or has not been dispatched, and 503 for a reservation whose carrier status cannot be asked, and shall describe the 201 answer of POST /dispatches with the tracking number and the estimated delivery date (a date, or null), and shall remove and rename nothing in it."
ears_type: "ubiquitous"
rationale: "A client in another system relies on the description; an addition is a minor version, a removal or rename is a major one."
---

The dispatch service's OpenAPI description carries the carrier status read, added as an addition.
