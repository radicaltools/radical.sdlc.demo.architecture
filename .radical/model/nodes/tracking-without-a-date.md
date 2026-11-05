---
id: "e89b4e32-1b49-4519-911a-c3c5dbcddb26"
type: "scenario"
label: "Tracking without a date"
given: "order o-8 is shipped with tracking number TRK-8, and the warehouse answers that its carrier status is in-transit and its estimated delivery date is null"
then: "the answer is 200 with trackingNumber TRK-8, status in-transit and estimatedDeliveryDate null, and order o-8 is still shipped"
when: "a client reads GET /orders/o-8/tracking"
---
