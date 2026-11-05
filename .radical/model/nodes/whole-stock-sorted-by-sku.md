---
id: "77269ff9-9c28-457b-b53c-a2e4fe08d335"
type: "scenario"
label: "Whole stock sorted by SKU"
given: "MUG-1 was received first with 4 on hand and none held; GRN-1 has 10 on hand and 3 held"
then: "the answer lists GRN-1 with 10 on hand, 3 held and 7 available, then MUG-1 with 4 on hand, 0 held and 4 available, in that order"
when: "a client asks for the whole stock"
---
