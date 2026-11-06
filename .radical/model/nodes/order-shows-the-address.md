---
id: "1b1faeda-39e3-48c5-8103-2b3aa13d2d88"
type: "scenario"
label: "Order shows the address"
given: "order o-1 is placed with the delivery address Dluga 1, Warsaw, 00-001, PL"
then: "the answer is 200 with the deliveryAddress street Dluga 1, city Warsaw, postal code 00-001, country PL"
when: "a client reads GET /orders/o-1"
---
