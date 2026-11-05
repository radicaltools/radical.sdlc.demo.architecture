---
id: "d7015b0f-265b-4b18-a010-f6f2b81eef29"
type: "scenario"
label: "Return refused twice"
given: "a reservation of 3 grinders that was dispatched and then returned, with 10 on hand and none held"
then: "the answer is 409, and 10 are on hand and 10 are available"
when: "a client returns it again with a new key L"
---
