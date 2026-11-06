---
id: "854d75c4-f913-479e-ab31-a539af0ac836"
type: "scenario"
label: "Unchecked address forwarded"
given: "a held reservation of 1 grinder with 5 on hand, and the carrier refuses the booking of a parcel whose country is not a two-letter code"
then: "the dispatch service sends the carrier the address as given, unchanged, the answer is 503 and the reservation is still held, with 5 on hand and none taken off the shelf"
when: "a client dispatches it with the delivery address Dluga 1, Warsaw, 00-001, POL"
---
