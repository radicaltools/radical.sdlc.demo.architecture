---
id: "10e1b070-2acb-47dc-81b4-05297e43fba5"
type: "scenario"
label: "Order with bad country refused"
given: "a cart with one mug and the delivery address Dluga 1, Warsaw, 00-001, POL"
then: "the answer is 400 and says the country is not a two-letter code, no order is stored, and the number of orders is unchanged"
when: "the customer checks out"
---
