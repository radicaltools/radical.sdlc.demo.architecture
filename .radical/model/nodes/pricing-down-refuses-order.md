---
id: "a3a6f6ec-9a4c-4390-9e02-744248fdb7c9"
type: "requirement"
label: "Pricing down refuses order"
action: "the orders service shall refuse the order with status 503 and keep nothing."
ears_type: "unwanted-behaviour"
unwanted_condition: "the pricing service cannot be reached while an order is placed"
---
