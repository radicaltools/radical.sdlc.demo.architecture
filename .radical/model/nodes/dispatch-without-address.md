---
id: "2f407d17-7fb9-40fb-9aa8-e4108a7ff956"
type: "requirement"
label: "Dispatch without address"
action: "the dispatch service shall book the carrier for the reservation's parcel with POST /parcels, its body holding reference and lines only, as it does today; have the stock service take the quantities off the shelf; and answer 201 with the tracking number and the estimated delivery date the carrier gave when it booked the parcel, or null when the carrier gave none."
ears_type: "event-driven"
rationale: "The deliveryAddress field is optional, so a request without it is still served as before. Making it required is a later change, once every Shop dispatch carries the address. Assumptions, not stated by the brief: the carrier books such a parcel without an address, as it does today, and nothing is refused."
trigger: "a client dispatches a held reservation with no deliveryAddress"
---
