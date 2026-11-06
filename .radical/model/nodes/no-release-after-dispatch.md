---
id: "f879d6e1-8cba-42bb-9d18-32e4d8d2da80"
type: "scenario"
label: "No release after dispatch"
given: "a dispatched reservation"
then: "the answer is 409, and availability does not change"
when: "a client releases it with Idempotency-Key k-2"
---
