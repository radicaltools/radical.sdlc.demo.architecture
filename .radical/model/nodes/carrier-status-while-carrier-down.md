---
id: "4e5856e4-cb5c-48d0-bad2-899e16a810ab"
type: "scenario"
label: "Carrier status while carrier down"
given: "reservation r-1 is dispatched with tracking number TRK-1, and a carrier that does not answer"
then: "the answer is 503, and r-1 is still dispatched with tracking number TRK-1"
when: "a client asks for the carrier status of r-1"
---
