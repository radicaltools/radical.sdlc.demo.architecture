---
id: "6113cf28-c911-43f7-8ef6-c4b67a43149f"
type: "requirement"
label: "Carrier status unavailable"
action: "the dispatch service shall answer 503 and leave the reservation as it is."
ears_type: "unwanted-behaviour"
unwanted_condition: "the carrier does not answer GET /parcels/{trackingNumber} with 200 and a status of in-transit, out-for-delivery, delivered or lost, while a client asks for the carrier status of a dispatched reservation"
---

The carrier cannot be asked for the status of a dispatched reservation.
