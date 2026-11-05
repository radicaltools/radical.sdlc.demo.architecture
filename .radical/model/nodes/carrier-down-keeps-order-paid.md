---
id: "4fce0583-fad1-475b-87ca-b49d34357c49"
type: "requirement"
label: "Carrier down keeps order paid"
action: "the orders service shall answer 503 and keep the order paid, so it can be shipped later."
ears_type: "unwanted-behaviour"
unwanted_condition: "the warehouse answers that the carrier is down while an order is shipped"
---
