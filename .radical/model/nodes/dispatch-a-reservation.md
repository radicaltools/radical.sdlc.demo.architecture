---
id: "188000c1-8a1e-485d-87a7-9fe26ada41a1"
type: "requirement"
label: "Dispatch a reservation"
action: "the dispatch service shall book the carrier for the reservation's parcel with POST /parcels, its body holding reference, lines and the deliveryAddress object with the four fields street, city, postalCode and country, the country a two-letter code such as PL, taken unchanged from the request's deliveryAddress object; have the stock service take the quantities off the shelf; and answer 201 with the tracking number and the estimated delivery date the carrier gave when it booked the parcel, or null when the carrier gave none."
ears_type: "event-driven"
trigger: "a client dispatches a held reservation with a delivery address, given in the request's deliveryAddress object"
---
