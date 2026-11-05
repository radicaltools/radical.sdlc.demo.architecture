---
id: "a29af2b5-2d98-4535-9ceb-4d21fc6ed918"
type: "scenario"
label: "Tracking of a shipped order"
given: "order o-7 is shipped with tracking number TRK-7, and the warehouse answers that its carrier status is in-transit"
then: "the answer is 200 with trackingNumber TRK-7 and status in-transit, and order o-7 is still shipped"
when: "a client reads GET /orders/o-7/tracking"
---
