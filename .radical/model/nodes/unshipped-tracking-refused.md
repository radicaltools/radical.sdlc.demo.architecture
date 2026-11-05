---
id: "d7de3872-1b91-4084-a4d4-550a09c55088"
type: "requirement"
label: "Unshipped tracking refused"
action: "the orders service shall answer 409 and keep the order as it is, without asking the warehouse for a carrier status."
ears_type: "unwanted-behaviour"
unwanted_condition: "a client reads the tracking of an order that has not shipped"
---
