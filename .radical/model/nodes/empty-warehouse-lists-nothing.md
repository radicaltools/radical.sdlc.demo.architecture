---
id: "afd0294b-56f5-4e50-be69-e2418407e7c5"
type: "scenario"
label: "Empty warehouse lists nothing"
given: "no SKU has ever been received"
then: "the answer is an empty list, not 404"
when: "a client asks for the whole stock"
---
