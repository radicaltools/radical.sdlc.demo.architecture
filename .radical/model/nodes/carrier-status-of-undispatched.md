---
id: "3165bcd1-fc89-4e7a-a21d-55f37aaba998"
type: "scenario"
label: "Carrier status of undispatched"
given: "reservation r-2 of 1 grinder is held and not dispatched"
then: "the answer is 404, and r-2 is still held"
when: "a client asks for the carrier status of r-2"
---
