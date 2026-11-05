---
id: "3f9b8f98-b0ab-4b5c-a813-2523fe246478"
type: "scenario"
label: "Dispatch without a date"
given: "a held reservation of 3 grinders, 10 on hand, and the carrier books its parcel with tracking number TRK-1 and no estimated delivery date"
then: "the carrier got one booking, the answer is 201 with tracking number TRK-1 and estimatedDeliveryDate null, 7 are on hand with none held, and the reservation is dispatched"
when: "a client dispatches it"
---
