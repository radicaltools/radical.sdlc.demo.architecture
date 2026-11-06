---
id: "2f407d17-7fb9-40fb-9aa8-e4108a7ff956"
type: "requirement"
label: "Dispatch refuses missing address"
action: "the dispatch service shall refuse the request, book no carrier, take nothing off the shelf and leave the reservation held."
ears_type: "unwanted-behaviour"
rationale: "A parcel without a complete address cannot be delivered, so the address is checked before the carrier is asked. Assumptions, not stated by the brief: the refusal is answered 400, and it holds while the carrier cannot be reached."
unwanted_condition: "a client dispatches a reservation with no deliveryAddress, or with one whose street, city or postalCode is missing or whose country is not a two-letter code"
---
