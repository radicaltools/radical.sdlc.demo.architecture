---
id: "e2e737e1-f4af-4d07-874b-e1776f80302c"
type: "scenario"
label: "Unshipped tracking refused"
given: "order o-8 is paid and not shipped"
then: "the answer is 409, order o-8 is still paid, and the warehouse is not asked for a carrier status"
when: "a client reads GET /orders/o-8/tracking"
---
