---
id: "21a41fb5-2d1c-44bf-a679-63b61dc2e68d"
type: "scenario"
label: "Carrier down, order waits"
given: "a paid order and a warehouse answering 503 because the carrier cannot be reached or refuses the booking"
then: "the answer is 503, and the order is still paid and not marked shipped"
when: "it is shipped"
---
