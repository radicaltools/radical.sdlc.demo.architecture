---
id: "3125af3d-40a8-4031-b5a3-a46fdb760037"
type: "scenario"
label: "Return refused after release"
given: "a released reservation of 3 grinders, 10 on hand and none held"
then: "the answer is 409, and 10 are on hand and 10 are available"
when: "a client returns it with key K"
---
