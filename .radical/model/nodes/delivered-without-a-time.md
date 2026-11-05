---
id: "a7967cd9-5d87-4410-ae61-f97c4a3cf64f"
type: "scenario"
label: "Delivered without a time"
given: "order o-10 is shipped with tracking number TRK-10, and the warehouse answers that its carrier status is delivered, its estimated delivery date is 2026-11-20 and its delivery time is null"
then: "the answer is 200 with trackingNumber TRK-10, status delivered, estimatedDeliveryDate 2026-11-20 and deliveredAt null, and order o-10 is still shipped"
when: "a client reads GET /orders/o-10/tracking"
---
