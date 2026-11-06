---
id: "5081f326-923a-42de-bef9-5fdf75ca1f4a"
type: "scenario"
label: "Carrier refuses booking"
given: "a held reservation of 1 grinder with 5 on hand, and the carrier refuses the booking of its parcel"
then: "the answer is 503 and the reservation is still held, with 5 on hand and none taken off the shelf"
when: "a client dispatches it with the delivery address Dluga 1, Warsaw, 00-001, PL"
---
