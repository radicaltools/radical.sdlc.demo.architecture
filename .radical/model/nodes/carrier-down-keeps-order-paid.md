---
id: "4fce0583-fad1-475b-87ca-b49d34357c49"
type: "requirement"
label: "Carrier down keeps order paid"
action: "the orders service shall answer 503 and keep the order paid and not marked shipped."
ears_type: "unwanted-behaviour"
unwanted_condition: "the warehouse answers 503 because the carrier cannot be reached or refuses the booking while an order is shipped"
---
