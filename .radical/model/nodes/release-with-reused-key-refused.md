---
id: "1f068e39-1001-4234-8e42-e86f8a9cb616"
type: "scenario"
label: "Release with reused key refused"
given: "reservation r-1 of 3 grinders, released with Idempotency-Key k-3; reservation r-2 of 2 grinders, held; 10 grinders on hand"
then: "the answer is 422, r-2 stays held, and 8 grinders are available"
when: "a client releases r-2 with Idempotency-Key k-3"
---
