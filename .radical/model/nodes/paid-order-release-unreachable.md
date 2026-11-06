---
id: "e37874d6-fed7-48cb-9532-78360308e91a"
type: "scenario"
label: "Paid order release unreachable"
given: "a paid order of 2 grinders, and the warehouse cannot be reached"
then: "the orders service answers 503, the order stays paid, and nothing is refunded"
when: "the customer cancels it"
---
