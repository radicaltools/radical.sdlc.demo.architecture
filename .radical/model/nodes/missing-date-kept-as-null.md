---
id: "43b98faf-1176-43e0-9344-cc33f53e8972"
type: "scenario"
label: "Missing date kept as null"
given: "reservation r-1 of 3 grinders is held, and the carrier books its parcel with tracking number TRK-1 and no estimated delivery date"
then: "the answer is 201 with estimatedDeliveryDate null, and a later GET /dispatches/r-1 answers 200 with estimatedDeliveryDate null as well"
when: "a client dispatches r-1 with the delivery address Dluga 1, Warsaw, 00-001, PL"
---
