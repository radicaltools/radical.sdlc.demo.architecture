---
id: "f30d3514-62a9-408a-b545-4e8ad3d51002"
type: "requirement"
label: "Order takes address"
action: "the orders service shall keep the delivery address on the order: street, city, postal code and country, the country a two-letter code such as PL, kept in uppercase whatever its case; it shall refuse an order whose address is missing one of these or whose country is not two letters in either case, answering 400 with a message that says what is wrong, and store no order."
ears_type: "event-driven"
rationale: "The carrier needs the address to deliver the parcel. The brief's answers set the 400 refusal and the uppercase country."
trigger: "a customer places an order"
---

The orders service keeps the delivery address on the order, and refuses an order with a missing or malformed address with 400.
