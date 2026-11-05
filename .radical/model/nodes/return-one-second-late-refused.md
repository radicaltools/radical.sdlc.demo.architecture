---
id: "cc84550a-ffa7-442a-8198-f52ab43e84bc"
type: "scenario"
label: "Return one second late refused"
given: "an order shipped at 2026-11-01T10:00:00Z, whose reservation r-1 holds 2 grinders, and 0 grinders on hand"
then: "the answer is 409, the order stays shipped, and the warehouse is not asked to return r-1"
when: "a customer returns the order at 2026-11-15T10:00:01Z"
---
