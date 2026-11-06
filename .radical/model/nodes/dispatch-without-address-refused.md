---
id: "f9f63e18-b955-42b5-8f12-adc0e7981b31"
type: "scenario"
label: "Dispatch without address refused"
given: "5 grinders on hand, and reservation r-1 of 1 grinder is held"
then: "the answer is 400, the carrier got 0 bookings, and r-1 is still held with 5 on hand"
when: "a client dispatches r-1 with no delivery address"
---
