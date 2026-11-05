---
id: "b653be94-49d8-4ba2-9385-e10c5d5afc60"
type: "scenario"
label: "Restart answers 503"
given: "reservation r-1 is dispatched with tracking number TRK-1, and the dispatch service restarts after that"
then: "the answer is 503, the carrier got no request, and r-1 is still dispatched"
when: "a client asks for the carrier status of r-1"
---
