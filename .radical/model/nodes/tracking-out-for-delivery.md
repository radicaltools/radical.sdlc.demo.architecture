---
id: "3d8a8c3c-d7fe-4c7b-8537-1feebdf0ca59"
type: "scenario"
label: "Tracking out for delivery"
given: "order o-11 is shipped with tracking number TRK-11, and the warehouse answers that its carrier status is out-for-delivery, its estimated delivery date is 2026-11-20 and its delivery time is null"
then: "the answer is 200 with trackingNumber TRK-11, status out-for-delivery, estimatedDeliveryDate 2026-11-20 and deliveredAt null, and order o-11 is still shipped"
when: "a client reads GET /orders/o-11/tracking"
---
