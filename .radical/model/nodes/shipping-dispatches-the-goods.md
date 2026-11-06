---
id: "54ed37ac-775d-4a21-b730-47ef31b7788c"
type: "requirement"
label: "Shipping dispatches the goods"
action: "the orders service shall have the warehouse dispatch its reservation with the order's delivery address, sent as the deliveryAddress object (street, city, postalCode and country), keep the tracking number on the order and mark it shipped."
ears_type: "event-driven"
trigger: "a paid order is shipped"
---
