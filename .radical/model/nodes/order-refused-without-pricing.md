---
id: "91171352-27d3-4040-bbe2-55d60a1870a9"
type: "scenario"
label: "Order refused without pricing"
given: "the pricing service is down, and a cart with one mug and the delivery address Dluga 1, Warsaw, 00-001, PL"
then: "the answer is 503 and no order exists."
when: "a customer places an order"
---
