---
id: "63cdcb57-2994-4dcb-bca1-23d200a48c70"
type: "scenario"
label: "Carrier status 404 unavailable"
given: "order o-10 is shipped with tracking number TRK-10, and the warehouse answers 404 for its reservation"
then: "the answer is 503, and order o-10 is still shipped with tracking number TRK-10"
when: "a client reads GET /orders/o-10/tracking"
---
