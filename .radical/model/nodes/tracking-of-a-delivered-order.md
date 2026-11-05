---
id: "2a07dd6c-0226-4db7-b569-5a95b37ce863"
type: "scenario"
label: "Tracking of a delivered order"
given: "order o-9 is shipped with tracking number TRK-9, and the warehouse answers that its carrier status is delivered, its estimated delivery date is 2026-11-20 and its delivery time is 2026-11-21T10:30:00Z"
then: "the answer is 200 with trackingNumber TRK-9, status delivered, estimatedDeliveryDate 2026-11-20 and deliveredAt 2026-11-21T10:30:00Z, and order o-9 is still shipped"
when: "a client reads GET /orders/o-9/tracking"
---
