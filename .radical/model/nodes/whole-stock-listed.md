---
id: "42f674c7-fe87-4213-9d3f-9b2104562112"
type: "requirement"
label: "Whole stock listed"
action: "the stock service shall answer with one entry for each SKU it has a stock item for, sorted by SKU ascending, each with its quantity on hand, its quantity held and its quantity available (on hand minus held); a SKU with nothing on hand or held still has an entry."
ears_type: "event-driven"
rationale: "Operators want to see the whole shelf at once."
trigger: "a client asks for the whole stock"
---

Listing every SKU at once, sorted, with on hand, held and available for each.
