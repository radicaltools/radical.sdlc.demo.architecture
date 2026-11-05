---
id: "7965a27e-3ed6-402a-916f-c3d83663513c"
type: "scenario"
label: "Carrier status unavailable"
given: "order o-9 is shipped, and the warehouse does not answer at all for the carrier status of its delivery"
then: "the answer is 503, and order o-9 is still shipped"
when: "a client reads GET /orders/o-9/tracking"
---
