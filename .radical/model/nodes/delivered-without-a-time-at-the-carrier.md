---
id: "f1cf2eb2-1819-4162-99c0-42c4987869ab"
type: "scenario"
label: "Delivered without a time at the carrier"
given: "reservation r-2 is dispatched with tracking number TRK-3 and estimated delivery date 2026-11-20, the dispatch service has not restarted since, and the carrier answers GET /parcels/TRK-3 with 200 and status delivered, with no delivery time"
then: "the answer is 200 with reservation r-2, tracking number TRK-3, status delivered, estimatedDeliveryDate 2026-11-20 and deliveredAt null, the carrier was asked GET /parcels/TRK-3, and r-2 is still dispatched with tracking number TRK-3"
when: "a client asks for the carrier status of r-2"
---
