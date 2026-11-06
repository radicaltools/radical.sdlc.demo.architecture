---
id: "d1ee7a35-57c2-43f1-a6ae-f66ea62854ed"
type: "scenario"
label: "Paid order release refused"
given: "a paid order of 2 grinders, whose reservation the warehouse has already dispatched"
then: "the orders service answers 409, the order stays paid, and nothing is refunded"
when: "the customer cancels it"
---
