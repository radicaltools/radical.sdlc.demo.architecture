---
id: "f5d4294d-c011-4e2b-8780-0cfa61a5113b"
type: "scenario"
label: "Same key, other body"
given: "a reservation of 3 grinders with key A was answered"
then: "the answer is 422, and only 3 are held"
when: "a client sends 4 grinders with key A"
---
