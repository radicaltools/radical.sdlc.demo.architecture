---
id: "16dc31e4-71db-46ee-8c25-5c11ff2ebc7e"
type: "scenario"
label: "Return key reused elsewhere"
given: "a dispatched reservation r-1 of 3 grinders was returned with key K, and a dispatched reservation r-2 of 1 grinder, with 10 grinders on hand"
then: "the answer is 422, and r-2 is still dispatched with 10 on hand"
when: "a client returns r-2 with key K"
---
