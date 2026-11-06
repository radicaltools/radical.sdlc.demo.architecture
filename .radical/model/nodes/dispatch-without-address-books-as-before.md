---
id: "f9f63e18-b955-42b5-8f12-adc0e7981b31"
type: "scenario"
label: "Dispatch without address books as before"
given: "5 grinders on hand, reservation r-1 of 1 grinder is held, and the carrier books a parcel with no estimated delivery date"
then: "the answer is 201 with a tracking number and estimatedDeliveryDate null, the carrier got one booking for r-1 whose body has no deliveryAddress, and r-1 is no longer held with 4 on hand"
when: "a client dispatches r-1 with no delivery address"
---
