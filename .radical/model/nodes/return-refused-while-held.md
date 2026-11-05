---
id: "d6d4e1ea-7a9a-4f50-b094-e323721a2cad"
type: "scenario"
label: "Return refused while held"
given: "a held reservation of 3 grinders, 10 on hand and 3 held"
then: "the answer is 409, and 10 are on hand with 3 held"
when: "a client returns it with key K"
---
