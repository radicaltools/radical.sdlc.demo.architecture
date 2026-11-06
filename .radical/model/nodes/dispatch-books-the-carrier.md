---
id: "9c55f757-6989-436c-bd48-f984a7efdcbc"
type: "scenario"
label: "Dispatch books the carrier"
given: "a held reservation of 3 grinders, 10 on hand, and the carrier books its parcel with estimated delivery date 2026-11-20"
then: "the carrier got one booking carrying the address Dluga 1, Warsaw, 00-001, PL, the answer has its tracking number and estimatedDeliveryDate 2026-11-20, and 7 are on hand with none held"
when: "a client dispatches it with the delivery address Dluga 1, Warsaw, 00-001, PL"
---
