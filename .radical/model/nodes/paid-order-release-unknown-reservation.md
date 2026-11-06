---
id: "280a9c11-1f80-49ca-be64-de80a14a921c"
type: "scenario"
label: "Paid order release unknown reservation"
given: "a paid order o-8 of 2 grinders, whose reservation the warehouse does not know: it has no reservation with Idempotency-Key o-8"
then: "the warehouse answers 404 to the release, the orders service answers 409, the order stays paid, and nothing is refunded"
when: "the customer cancels order o-8"
---
