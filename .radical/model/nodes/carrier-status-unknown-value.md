---
id: "5a5c2996-6b13-42ee-9f2a-f18102f79952"
type: "scenario"
label: "Carrier status unknown value"
given: "reservation r-1 is dispatched with tracking number TRK-1, and the carrier answers GET /parcels/TRK-1 with 200 and status returned"
then: "the answer is 503, and r-1 is still dispatched with tracking number TRK-1"
when: "a client asks for the carrier status of r-1"
---
