---
id: "51a75223-9b26-4d60-b873-65250527c5fb"
type: "scenario"
label: "Return repeat changes nothing"
given: "a dispatched reservation of 3 grinders was returned with key K, and 10 are on hand and none held"
then: "the answer is the same as the first, and 10 are on hand and 10 are available"
when: "a client returns it again with key K"
---
