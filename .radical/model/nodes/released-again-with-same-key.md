---
id: "09155768-81b2-453e-b699-8050a57dd6c5"
type: "scenario"
label: "Released again with same key"
given: "a reservation of 3 grinders, released with Idempotency-Key k-1, 10 available"
then: "the answer is the same released reservation, and 10 are available"
when: "a client releases it again with Idempotency-Key k-1"
---
