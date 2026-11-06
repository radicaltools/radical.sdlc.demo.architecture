---
id: "410d600a-c182-4971-8c2d-e31d3d8a14dc"
type: "scenario"
label: "Paid order release key reused"
given: "a paid order o-7 of 2 grinders, held as reservation r-7; another client released reservation r-9 of 1 grinder with Idempotency-Key o-7, so the warehouse has seen o-7 for another reservation"
then: "the warehouse answers 422 to the release of r-7, the orders service answers 409, the order stays paid, r-7 stays held, and nothing is refunded"
when: "the customer cancels order o-7"
---
