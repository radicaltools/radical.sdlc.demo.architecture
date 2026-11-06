---
id: "de5d2cb5-36bd-463b-9336-1625671cc9d1"
type: "scenario"
label: "Carrier status out for delivery"
given: "reservation r-1 of 3 grinders is dispatched with tracking number TRK-1 and estimated delivery date 2026-11-20, the dispatch service has not restarted since, and the carrier reports it out-for-delivery"
then: "the answer is 200 with reservation r-1, tracking number TRK-1, status out-for-delivery, estimatedDeliveryDate 2026-11-20 and deliveredAt null, the carrier got no new booking from this request, and r-1 is still dispatched"
when: "a client asks for the carrier status of r-1"
---
