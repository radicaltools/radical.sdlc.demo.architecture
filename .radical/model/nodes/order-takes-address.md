---
id: "f30d3514-62a9-408a-b545-4e8ad3d51002"
type: "requirement"
label: "Order takes address"
action: "the orders service shall keep the delivery address on the order: street, city, postal code and country, the country a two-letter code such as PL; it shall refuse an order whose address is missing one of these or whose country is not two letters, and store no order."
ears_type: "event-driven"
rationale: "The carrier needs the address to deliver the parcel. The brief names no status code for the refusal; the status code is left open and listed in the report as an assumption."
trigger: "a customer places an order"
---
