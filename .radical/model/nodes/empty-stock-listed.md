---
id: "da8819ba-1fd4-498c-a740-ef8c68030ddc"
type: "requirement"
label: "Empty stock listed"
action: "the stock service shall answer with an empty list."
ears_type: "event-driven"
rationale: "Every SKU the warehouse has, when there are none, is none."
trigger: "a client asks for the whole stock while the warehouse has no SKU"
---

A whole-stock request before any SKU exists gets an empty list, not an error.
