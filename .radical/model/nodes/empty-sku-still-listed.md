---
id: "72a67d93-676f-44ab-8263-3bcbaa0df878"
type: "scenario"
label: "Empty SKU still listed"
given: "GRN-1 had 3 on hand, all of them dispatched, so none on hand and none held"
then: "the answer lists GRN-1 with 0 on hand, 0 held and 0 available"
when: "a client asks for the whole stock"
---
