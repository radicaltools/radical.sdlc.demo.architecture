---
id: "cfe39ca5-e5dd-420e-904b-7c8d38a136cc"
type: "scenario"
label: "Carrier status delivered"
given: "reservation r-1 is dispatched with tracking number TRK-2 and estimated delivery date 2026-11-20, the dispatch service has not restarted since, and the carrier answers GET /parcels/TRK-2 with 200, status delivered and deliveredAt 2026-11-21T10:30:00Z"
then: "the answer is 200 with reservation r-1, tracking number TRK-2, status delivered, estimatedDeliveryDate 2026-11-20 and deliveredAt 2026-11-21T10:30:00Z, the carrier was asked GET /parcels/TRK-2, and r-1 is still dispatched with tracking number TRK-2"
when: "a client asks for the carrier status of r-1"
---
