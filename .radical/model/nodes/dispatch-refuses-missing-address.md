---
id: "2f407d17-7fb9-40fb-9aa8-e4108a7ff956"
type: "requirement"
label: "Dispatch refuses missing address"
action: "the dispatch service shall answer 400, book no carrier, take nothing off the shelf and leave the reservation held, whether or not the carrier can be reached."
ears_type: "unwanted-behaviour"
rationale: "A parcel without a complete address cannot be delivered. The address is checked before the carrier is asked, so a missing address is answered 400 even while the carrier is down."
unwanted_condition: "a client dispatches a reservation with no deliveryAddress, or with one whose street, city or postalCode is missing or whose country is not a two-letter code"
---
