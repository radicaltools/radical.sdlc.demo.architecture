---
id: "dfbc548d-885e-40af-b98f-7a287fff3f30"
type: "requirement"
label: "Repeated payment reserves once"
action: "the orders service shall answer that it is paid and hold nothing more in the warehouse."
ears_type: "unwanted-behaviour"
unwanted_condition: "a customer pays an order again, after losing the answer or while an earlier payment of the same order is still in progress"
---
