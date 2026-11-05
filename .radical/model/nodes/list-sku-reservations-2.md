---
id: "92bf5f01-5181-4054-9dbe-1719122aed88"
type: "requirement"
label: "List SKU reservations"
action: "the stock service shall answer 200 with one entry for each reservation in the held state that holds a quantity of that SKU, sorted by the number in the reservation id ascending, so r-2 comes before r-10, each entry with the reservation's id and the quantity of that SKU it holds; an empty list when no held reservation holds that SKU. Released, dispatched and returned reservations are never listed."
ears_type: "event-driven"
rationale: "People on the floor want to see what is holding a SKU before they move goods. The ledger numbers reservations in the order they are made, so a lower number was made earlier; the sort compares the number, not the text of the id."
trigger: "a client asks for the reservations holding a SKU the warehouse has a stock item for"
---

Operators see what holds a SKU before goods move.
