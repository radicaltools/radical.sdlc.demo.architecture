---
id: "681eedbe-5b3b-44cd-b8a4-6498cb6d0e46"
type: "requirement"
label: "Dispatch without a date"
action: "the dispatch service shall dispatch the reservation as usual: book no second parcel, have the stock service take the quantities off the shelf, and answer 201 with the tracking number and estimatedDeliveryDate null. A missing date shall not fail the dispatch."
ears_type: "event-driven"
rationale: "The parcel is booked and goes on. The carrier may not know the date when it books, and the customer then sees the status without a date."
trigger: "the carrier's answer to the booking of a held reservation's parcel has no estimatedDeliveryDate, or it is null"
---
