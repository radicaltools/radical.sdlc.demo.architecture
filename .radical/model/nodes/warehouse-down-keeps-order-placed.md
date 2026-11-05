---
id: "a399a73e-b996-4529-9345-ea1efe1de733"
type: "requirement"
label: "Warehouse down keeps order placed"
action: "the orders service shall answer 503 and keep the order placed."
ears_type: "unwanted-behaviour"
unwanted_condition: "the warehouse cannot be reached while an order is paid"
---
