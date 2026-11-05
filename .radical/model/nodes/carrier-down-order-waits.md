---
id: "21a41fb5-2d1c-44bf-a679-63b61dc2e68d"
type: "scenario"
label: "Carrier down, order waits"
given: "a paid order and a warehouse answering that the carrier is down"
then: "the answer is 503, the order is paid, and shipping it again works once the carrier is back"
when: "it is shipped"
---
