---
id: "007ba067-d6e2-425f-b50d-1806f5527930"
type: "scenario"
label: "Estimated date kept as given"
given: "reservation r-1 of 3 grinders is held, and the carrier books its parcel with tracking number TRK-1 and estimated delivery date 2026-11-20"
then: "the answer is 201 with tracking number TRK-1 and estimatedDeliveryDate 2026-11-20, and a later GET /dispatches/r-1 answers 200 with estimatedDeliveryDate 2026-11-20 as well"
when: "a client dispatches r-1 with the delivery address Dluga 1, Warsaw, 00-001, PL"
---
