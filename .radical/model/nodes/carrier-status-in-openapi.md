---
id: "cc0024d1-1b47-4deb-a9b4-1aa24734b508"
type: "requirement"
label: "Carrier status in OpenAPI"
action: "the dispatch service shall describe GET /dispatches/{reservationId} in its OpenAPI description, with a 200 answer holding the tracking number, the estimated delivery date and the status, 404 for a reservation that does not exist or has not been dispatched, and 503 for a reservation whose carrier status cannot be asked, and shall describe the 200 answer of POST /dispatches with the tracking number and the estimated delivery date, and shall remove and rename nothing in it."
ears_type: "ubiquitous"
rationale: "A client in another system relies on the description; an addition is a minor version, a removal or rename is a major one."
---

The dispatch service's OpenAPI description carries the carrier status read, added as an addition.
