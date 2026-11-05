---
id: "16517c9d-13e8-4927-a4c1-f14c77860588"
type: "scenario"
label: "Carrier status of a dispatched reservation"
given: "reservation r-1 of 3 grinders is dispatched with tracking number TRK-1 and estimated delivery date 2026-11-20, the dispatch service has not restarted since, and the carrier reports it in-transit"
then: "the answer is 200 with reservation r-1, tracking number TRK-1, status in-transit, estimatedDeliveryDate 2026-11-20 and deliveredAt null, the carrier got no new booking from this request, and r-1 is still dispatched"
when: "a client asks for the carrier status of r-1"
---
