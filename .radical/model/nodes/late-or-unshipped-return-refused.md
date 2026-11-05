---
id: "52ecbaac-11f8-454c-90e3-a9fd04c67524"
type: "requirement"
label: "Late or unshipped return refused"
action: "the orders service shall answer 409 and keep the order as it is, without asking the warehouse to return anything."
ears_type: "unwanted-behaviour"
unwanted_condition: "a customer returns an order that is not shipped, or was shipped more than 14 days before"
---
