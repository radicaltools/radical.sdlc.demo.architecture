---
id: "7f3a9678-5604-4be3-8a68-183cde7c86b6"
type: "scenario"
label: "Released goods come back"
given: "a held reservation of 3 grinders, 7 available"
then: "10 are available"
when: "a client releases it with Idempotency-Key k-1"
---
